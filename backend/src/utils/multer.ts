import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import dayjs from "dayjs";

multer.MulterError;

const ROOT_FOLDER_NAME = "uploads";
const FILE_MAX_SIZE = 5 * 1024 * 1024;

if (!fs.existsSync(ROOT_FOLDER_NAME)) {
  fs.mkdirSync(ROOT_FOLDER_NAME, { recursive: true });
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.lastIndexOf("image") > -1) {
    if (req.originalFileNames) {
      req.originalFileNames = [...req.originalFileNames, file.originalname];
    } else {
      req.originalFileNames = [file.originalname];
    }

    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const isDefaultFile = (param: string) => {
  if (param === "null" || param === null) {
    return true;
  } else {
    return false;
  }
};

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: FILE_MAX_SIZE }
});
