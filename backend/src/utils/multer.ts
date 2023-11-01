import { NextFunction, Request } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";

import { File } from "../utils/gcp.util.js";
import { ContentType } from "../utils/router.util.js";

import BadRequestError from "../errors/badRequest.error.js";
import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error.js";
import InternalServerError from "../errors/internalServer.error.js";

const FILE_MAX_SIZE = 5 * 1024 * 1024;

export interface MulterUploadFile {
  contentType: ContentType;
  req: Request;
  err: any;
  next: NextFunction;
}

export interface MulterUpdateFile {
  fieldname: string;
  contentType: ContentType;
  req: Request;
  err: any;
  next: NextFunction;
}

export interface MulterFieldUploadFile {
  singleFieldNames: string[];
  multipleFieldNames: string[];
  contentType: ContentType;
  req: Request;
  err: any;
  next: NextFunction;
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

const isDefaultFile = (param: string) => {
  if (param === "null" || param === null) {
    return true;
  } else {
    return false;
  }
};

const errorHandling = (err: any) => {
  if (err instanceof MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    throw new BadRequestError("Unexpected file. Please Check your image field name or image count");
  } else if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    throw new BadRequestError("Image size must be less than 5MB");
  } else if (err instanceof MulterError && err.code === "LIMIT_FILE_COUNT") {
    throw new BadRequestError("Too many images");
  } else if (err) {
    throw new InternalServerError("Image Unknown error");
  }
};

export const updateFileFunc = (info: MulterUpdateFile, callback: Function) => {
  const { contentType, req, err, fieldname, next } = info;
  try {
    errorHandling(err);

    if (contentType === "form-data") {
      console.log("fdfdfdfdfd");

      if (!req.file) throw new BadRequestError("You must request images");

      callback(req.file);
    } else if (contentType === "json") {
      let image: null | undefined = undefined;
      console.log(req.body);
      console.log(req.body[fieldname]);

      if (isDefaultFile(req.body[fieldname])) {
        console.log("imaimamaimai");
        image = null;
      }

      callback(image);
    } else {
      throw new UnsupportedMediaTypeError("You must request any data");
    }
  } catch (error) {
    next(error);
  }
};

export const uploadFileFunc = (info: MulterUploadFile, callback: Function) => {
  const { contentType, req, err, next } = info;

  try {
    errorHandling(err);

    if (contentType === "form-data") {
      if (!req.file) throw new BadRequestError("You must request images");

      callback(req.file);
    } else {
      callback(undefined);
    }
  } catch (error) {
    next(error);
  }
};

export const uploadFilesFunc = (info: MulterUploadFile, callback: Function) => {
  const { contentType, req, err, next } = info;
  console.log(req.files);
  console.log(req.file);

  try {
    errorHandling(err);

    if (contentType === "form-data") {
      if (!req.files || (req.files.length as number) === 0) throw new BadRequestError("You must request images");
      else if (req.originalFileNames?.length !== req.files.length)
        throw new BadRequestError("The image is not uploaded properly. Please check if there are any damaged images.");

      callback(req.files as File[]);
    } else {
      callback(undefined);
    }
  } catch (error) {
    next(error);
  }
};

export const uploadFieldsFunc = (info: MulterFieldUploadFile, callback: Function) => {
  const { contentType, req, err, next } = info;

  try {
    errorHandling(err);
    const files = req.files as { [fieldname: string]: File[] };
    const singleImages: Record<string, File> = {};
    const multipleImages: Record<string, File[]> = {};

    if (contentType === "form-data") {
      info.singleFieldNames.forEach((fieldname: string) => {
        if (files[fieldname] && files[fieldname].length > 0) singleImages[fieldname] = files[fieldname][0];
      });

      info.multipleFieldNames.forEach((fieldname: string) => {
        if (files[fieldname] && files[fieldname].length > 0) multipleImages[fieldname] = files[fieldname];
      });

      callback(singleImages, multipleImages);
    } else {
      callback(undefined);
    }
  } catch (error) {
    next(error);
  }
};

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: FILE_MAX_SIZE }
});
