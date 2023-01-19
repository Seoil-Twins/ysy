import dotenv from "dotenv";
import * as fs from "fs";
import { initializeApp } from "firebase/app";
import { deleteObject, getStorage, ref, uploadBytes } from "firebase/storage";

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
 * Firebase Storage를 통해 이미지를 업로드 합니다.
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
