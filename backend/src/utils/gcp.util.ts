import dotenv from "dotenv";
import { ApiError, Storage } from "@google-cloud/storage";

import logger from "../logger/logger";

import { ErrorImage } from "../models/errorImage.model";
import UploadError from "../errors/upload.error";
import { UNKNOWN_NAME } from "../constants/file.constant";

dotenv.config();

const projectId = process.env.GCP_PROJECT_ID;
const keyFilename = process.env.GCP_KEY_FILE_NAME;
const bucketname = process.env.GCP_BUCKET_NAME ? process.env.GCP_BUCKET_NAME : "ysy-bucket";

const storage = new Storage({
  projectId,
  keyFilename
});

const bucket = storage.bucket(bucketname);

export type File = Express.Multer.File;

export interface UploadImageInfo {
  filename: string;
  buffer: Buffer;
  mimetype: string;
}

export interface DeleteImageInfo {
  size: number;
  type: string;
  path: string;
  location: string;
}

/**
 * 이미지를 다운로드 받아 Buffer로 변환시켜 반환합니다.
 * @param path 이미지 저장 경로
 * @returns <Promise<{@link Buffer} | null>>
 */
export const getFileBufferWithGCP = async (path: string): Promise<Buffer | null> => {
  try {
    const [buffer]: [Buffer] = await bucket.file(path).download();
    return buffer;
  } catch (error) {
    if (error instanceof ApiError && error.code === 404) {
      return null;
    } else {
      logger.error(`GCP Select Error : ${JSON.stringify(error)}`);
      throw null;
    }
  }
};

/**
 * 단일 이미지를 업로드 합니다.
 * @param file {@link UploadImageInfo}
 */
export const uploadFileWithGCP = async (file: UploadImageInfo): Promise<void> => {
  try {
    await bucket.file(file.filename).save(file.buffer, {
      contentType: file.mimetype
    });
  } catch (error) {
    logger.error(`GCP Upload Error : ${JSON.stringify(error)}`);
    throw error;
  }
};

/**
 * 다중 이미지를 업로드 합니다.
 * 모두 성공한다면 true를 반환하고, 1개라도 실패하면 false를 반환합니다.
 * 한 개라도 실패하였다면 deleteFiles를 호출해 이미지를 삭제해야합니다.
 * @param files {@link UploadImageInfo UploadImageInfo[]}
 * @returns Promise\<boolean\>
 */
export const uploadFilesWithGCP = async (files: UploadImageInfo[]): Promise<boolean> => {
  const promises: any[] = [];

  try {
    for (const file of files) {
      const blob = bucket.file(file.filename);
      promises.push(blob.save(file.buffer, { contentType: file.mimetype }));
    }

    const results = await Promise.allSettled(promises);
    const failedResults = results.filter((result) => result.status === "rejected");

    if (failedResults.length > 0) {
      return false;
    }

    return true;
  } catch (error) {
    logger.warn(`Multiple Image Upload Failed : ${JSON.stringify(error)}`);
    return false;
  }
};

export const moveFilesWithGCP = async (rootPath: string, filePaths: string[]): Promise<string[]> => {
  const files = filePaths.map((filePath: string) => {
    return {
      path: filePath,
      size: 0,
      mimetype: UNKNOWN_NAME,
      isMoved: false
    };
  });

  try {
    const movePromises = files.map(async (file) => {
      const blob = bucket.file(file.path);
      const splitedName = blob.name.split("/");
      const filename = splitedName[splitedName.length - 1];

      try {
        await blob.copy(rootPath + filename);

        file.size = blob.metadata.size ? Number(blob.metadata.size) : 0;
        file.mimetype = blob.metadata.contentType ? blob.metadata.contentType : UNKNOWN_NAME;
        file.isMoved = true;
      } catch (error) {
        if (error instanceof ApiError && error.code === 404) {
          logger.warn(`Not found image with gcp : ${JSON.stringify(file.path)}`);
          file.isMoved = true;
        }
      }
    });

    await Promise.all(movePromises);

    const successFiles = files.filter((file) => file.isMoved);
    const failedFiles = files.filter((file) => !file.isMoved);

    if (failedFiles.length > 0) {
      const rollbackFiles: DeleteImageInfo[] = successFiles.map((file) => {
        return {
          location: "gcp/moveFiles",
          path: file.path,
          size: file.size,
          type: file.mimetype
        };
      });

      throw new UploadError(rollbackFiles, "File Moves Error");
    }

    return successFiles.map((item) => item.path);
  } catch (error) {
    if (error instanceof UploadError) {
      deleteFilesWithGCP(error.errors);
      throw error;
    } else {
      logger.error(`Unknown Error : ${JSON.stringify(error)}`);
      throw error;
    }
  }
};

/**
 * 단일 이미지를 삭제합니다.
 * 만약, 삭제하지 못했다면 Error Image에 추가됩니다.
 * @param info {@link DeleteImageInfo}
 */
export const deleteFileWithGCP = async (info: DeleteImageInfo): Promise<void> => {
  try {
    await bucket.file(info.path).delete();
  } catch (error: any) {
    if (error instanceof ApiError && error.code === 404) {
      logger.error(`Notfound error with delete image ${JSON.stringify(error)}`);
    } else {
      try {
        await ErrorImage.create({
          path: info.path,
          size: info.size,
          errorLocation: info.location,
          type: info.type
        });
      } catch (error) {
        logger.error(`Unknown error with insert image ${JSON.stringify(error)}`);
      }

      throw error;
    }
  }
};

/**
 * 다중 이미지를 삭제합니다.
 * 만약, 삭제하지 못했다면 Error Image에 추가됩니다.
 *
 * 이 작업은 비동기로 이루어지기 때문에 백그라운드에서 동작됩니다.
 * @param infos {@link DeleteImageInfo DeleteImageInfo[]}
 */
export const deleteFilesWithGCP = (infos: DeleteImageInfo[]): void => {
  for (const info of infos) {
    const blob = bucket.file(info.path);

    blob.delete().catch((error) => {
      if (error instanceof ApiError && error.code === 404) return;

      ErrorImage.create({
        path: info.path,
        size: info.size,
        errorLocation: info.location,
        type: info.type
      }).catch((error) => {
        logger.error(`Unknown error with insert images ${JSON.stringify(error)}`);
      });
    });
  }
};
