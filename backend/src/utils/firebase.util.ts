import dotenv from "dotenv";
import * as fs from "fs";
import { initializeApp, FirebaseError } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, ListResult, listAll } from "firebase/storage";

import logger from "../logger/logger";

import { ErrorImage } from "../models/errorImage.model";

dotenv.config();

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SEND_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

/**
 * 이미지 파일 이름이 default로 변경하기 위한 이미지인지 확인합니다.
 * @param fileName 이미지 파일 이름
 * @returns default image : true else false
 */
export const isDefaultFile = (fileName: string): boolean => {
  let result = false;

  if (fileName === "default.jpg" || fileName === "default.png" || fileName === "default.svg") {
    result = true;
  }

  return result;
};

/**
 * 모든 이미지를 가져옵니다.
 * 모든 이미지를 가져오기 때문에 많은 이미지를 저장하고 있는 곳에서 사용하는 건 추천하지 않습니다.
 * @param path Folder 위치
 * @returns 이미지의 리스트를 반환
 */
const getAllFiles = async (path: string): Promise<ListResult> => {
  const listRef = ref(storage, path);
  const result: ListResult = await listAll(listRef);

  return result;
};

/**
 * Firebase Storage를 통해 하나의 이미지를 업로드 합니다.
 * @param path 이미지 경로
 * @param filePath 이미지가 임시 저장된 경로
 */
export const uploadFile = async (path: string, filePath: string): Promise<void> => {
  const storageRef = ref(storage, path);

  /**
   * Formidable PersistentFile Type은 File Type이 아니기 때문에
   * fs를 통해 해당 file path를 가져와 Buffer로 변경
   */
  const buffer = await fs.readFileSync(filePath);

  await uploadBytes(storageRef, buffer);
};

/**
 * 여러 개의 이미지를 Firebase Storage에 업로드 합니다.
 * @param filePaths 컴퓨터에 임시 저장되어 있는 파일 주소
 * @param imagePaths Firebase Storage에 저장할 주소
 * @returns [성공한 배열, 실패한 배열]
 */
export const uploadFiles = async (filePaths: string[], imagePaths: string[]): Promise<PromiseSettledResult<any>[][]> => {
  const promises: any[] = [];

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    const imagePath = imagePaths[i];
    const storageRef = ref(storage, imagePath);
    const buffer = await fs.readFileSync(filePath);

    promises.push(uploadBytes(storageRef, buffer));
  }

  const results: PromiseSettledResult<any>[] = await Promise.allSettled(promises);
  const successResults = results.filter((result) => result.status === "fulfilled" && result.value);
  const failedResults = results.filter((result) => result.status === "rejected");

  return [successResults, failedResults];
};

/**
 * Firebase Storage를 통해 이미지를 삭제합니다.
 * 만약 Firebase 문제가 아닌 모종의 이유로 삭제가 되지 않았다면 ErrorImage Table에 추가됩니다.
 * @param path 이미지 경로
 * @param folderName Firebase Storage 폴더 이름
 */
export const deleteFile = async (path: string): Promise<void> => {
  const delRef = ref(storage, path);

  try {
    await deleteObject(delRef);
  } catch (error) {
    const images: ListResult = await getAllFiles(path);

    if (error instanceof FirebaseError || (images.items.length && images.items.length > 0)) {
      try {
        if (error instanceof Error) logger.warn(`Image not deleted : ${path} => ${error.stack}`);
        else logger.warn(`Image not deleted : ${path} => ${new Error().stack}`);
      } catch (_error) {}

      await ErrorImage.create({
        path: path,
        size: 1,
        errorLocation: "any",
        type: "images/type"
      });
      return;
    } else {
      throw error;
    }
  }
};

/**
 * 여러 개의 파일을 Firebase storage에서 삭제합니다.
 * @param paths 파일 경로 리스트
 */
export const deleteFiles = async (paths: string[]): Promise<void> => {
  if (!paths.length || paths.length <= 0) return;

  const promises: any[] = [];

  paths.forEach((path: string) => {
    const delRef = ref(storage, path);
    promises.push(deleteObject(delRef));
  });

  const results: PromiseSettledResult<any>[] = await Promise.allSettled(promises);
  const failedResults = results.filter((result) => result.status === "rejected");

  if (failedResults.length > 0) {
    failedResults.forEach((failed) => {
      if (failed.status === "rejected") logger.warn(`Delete image file error => ${JSON.stringify(failed.reason)}`);
    });

    // firebase storage error는 무조건 요청한 path의 값을 주지 않기 때문에 모두 확인
    paths.forEach(async (path: string) => {
      const images = await getAllFiles(path);

      if (images.items.length && images.items.length > 0) {
        for (const image of images.items) {
          logger.warn(`Image not deleted : ${image.fullPath}`);
          await ErrorImage.create({
            path: image.fullPath,
            size: 1,
            errorLocation: "any",
            type: "images/type"
          });
        }

        logger.warn(`------------------------------------------------------------------------------------------`);
      }
    });
  }
};

/**
 * Firebase Storage 폴더를 삭제합니다.
 * 만약 Firebase 문제가 아닌 모종의 이유로 삭제가 되지 않았다면 ErrorImage Table에 추가됩니다.
 * @param path 폴더 경로
 */
export const deleteFolder = async (path: string): Promise<void> => {
  const folderRef = ref(storage, path);
  const fileList = await listAll(folderRef);
  const promises = [];

  if (fileList.items.length <= 0) return;

  for (let item of fileList.items) {
    promises.push(deleteObject(item));
  }

  const results: PromiseSettledResult<any>[] = await Promise.allSettled(promises);
  const failedResults = results.filter((result) => result.status === "rejected");

  if (failedResults.length > 0) {
    failedResults.forEach((failed) => {
      if (failed.status === "rejected") logger.warn(`Delete image file error => ${JSON.stringify(failed.reason)}`);
    });

    // firebase storage error는 무조건 요청한 path의 값을 주지 않기 때문에 모두 확인
    const images = await getAllFiles(path);

    if (images.items.length && images.items.length > 0) {
      try {
        logger.warn(`Image Folder not deleted : ${path} => ${new Error().stack}`);
      } catch (_error) {}

      for (const image of images.items) {
        logger.warn(`Image not deleted : ${image.fullPath}`);
        await ErrorImage.create({
          path: image.fullPath,
          size: 1,
          errorLocation: "any",
          type: "images/type"
        });
      }

      logger.warn(`------------------------------------------------------------------------------------------`);
    }
  }
};

export default firebaseApp;
