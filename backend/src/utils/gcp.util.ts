import dotenv from "dotenv";
import { ApiError, Storage, File as StorageFile } from "@google-cloud/storage";

import logger from "../logger/logger";

import { ErrorImage } from "../models/errorImage.model";

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

export const deleteFilesWithGCP = async (infos: DeleteImageInfo[]): Promise<void> => {
  for (const info of infos) {
    const blob = bucket.file(info.path);

    blob.delete().catch(async (error) => {
      if (error instanceof ApiError && error.code === 404) return;

      try {
        await ErrorImage.create({
          path: info.path,
          size: info.size,
          errorLocation: info.location,
          type: info.type
        });
      } catch (error) {
        logger.error(`Unknown error with insert images ${JSON.stringify(error)}`);
      }
    });
  }
};
