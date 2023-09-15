import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const FILE_MAX_SIZE = 5 * 1024 * 1024;

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
