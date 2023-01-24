import dotenv from "dotenv";
import * as fs from "fs";
import { initializeApp, FirebaseError } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, ListResult, list } from "firebase/storage";

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
 * 해당 폴더의 모든 이미지를 가져옵니다.
 * @param folderName Firebase Folder Name
 * @returns 이미지 객체 리스트를 반환
 */
export const getFiles = async (folderName: string, count: number, nextPageToken?: string): Promise<ListResult> => {
    const listRef = ref(storage, `${folderName}`);
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
 * @param fileName 이미지 파일 이름
 * @param folderName Firebase Storage 폴더 이름
 * @param filePath 이미지가 임시 저장된 경로
 */
export const uploadFile = async (fileName: string, folderName: string, filePath: string): Promise<void> => {
    const storageRef = ref(storage, `${folderName}/${fileName}`);

    /**
     * Formidable PersistentFile Type은 File Type이 아니기 때문에
     * fs를 통해 해당 file path를 가져와 Buffer로 변경
     */
    const srcToFile = await fs.readFileSync(filePath);

    await uploadBytes(storageRef, srcToFile);
};

/**
 * Firebase Storage를 통해 이미지를 삭제합니다.
 * @param fileName 이미지 파일 이름
 * @param folderName Firebase Storage 폴더 이름
 */
export const deleteFile = async (fileName: string, folderName: string): Promise<void> => {
    const delRef = ref(storage, `${folderName}/${fileName}`);
    await deleteObject(delRef);
};

export default firebaseApp;
