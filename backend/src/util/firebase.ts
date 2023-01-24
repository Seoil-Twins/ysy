import dotenv from "dotenv";
import * as fs from "fs";
import { initializeApp, FirebaseError } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, ListResult, list, listAll } from "firebase/storage";

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
 * N개의 이미지를 가져옵니다.
 * @param folderName Folder 이름
 * @param count 가져올 이미지의 개수
 * @param nextPageToken 다음 페이지의 토큰
 * @returns 이미지의 리스트를 반환
 */
export const getFiles = async (path: string, count: number, nextPageToken?: string): Promise<ListResult> => {
    const listRef = ref(storage, `${path}`);
    let result: ListResult | undefined = undefined;

    try {
        result = await list(listRef, {
            maxResults: count,
            pageToken: nextPageToken
        });
    } catch (error) {
        // nextPageToken이 유효하지 않은 경우
        if (error instanceof FirebaseError && error.code === "storage/unknown") {
            result = await list(listRef, {
                maxResults: count
            });
        } else {
            throw error;
        }
    }

    return result;
};

/**
 * Firebase Storage를 통해 하나의 이미지를 업로드 합니다.
 * @param path 이미지 경로와 이름
 * @param folderName Firebase Storage 폴더 이름
 * @param filePath 이미지가 임시 저장된 경로
 */
export const uploadFile = async (path: string, folderName: string, filePath: string): Promise<void> => {
    const storageRef = ref(storage, `${folderName}/${path}`);

    /**
     * Formidable PersistentFile Type은 File Type이 아니기 때문에
     * fs를 통해 해당 file path를 가져와 Buffer로 변경
     */
    const srcToFile = await fs.readFileSync(filePath);

    await uploadBytes(storageRef, srcToFile);
};

/**
 * Firebase Storage를 통해 이미지를 삭제합니다.
 * @param path 이미지 경로와 이름
 * @param folderName Firebase Storage 폴더 이름
 */
export const deleteFile = async (path: string, folderName: string): Promise<void> => {
    const delRef = ref(storage, `${folderName}/${path}`);
    await deleteObject(delRef);
};

/**
 * Firebase Storage 폴더를 삭제합니다.
 * @param path 폴더 경로
 * @param folderName 폴더 이름
 */
export const deleteFolder = async (path: string, folderName: string): Promise<PromiseSettledResult<void>[]> => {
    const folderRef = ref(storage, `${folderName}/${path}`);
    const fileList = await listAll(folderRef);
    const promises = [];

    for (let item of fileList.items) {
        promises.push(deleteObject(item));
    }

    /**
     * Promise.all => N개의 Promise를 수행 중 하나라도 거부(reject) 당하면 바로 에러를 반환
     * Promise.allSettled => 이행/거부 여부와 관계없이 주어진 Promise가 모두 완료될 때 까지 기달림
     */
    const results = await Promise.allSettled(promises);
    return results;
};

export default firebaseApp;
