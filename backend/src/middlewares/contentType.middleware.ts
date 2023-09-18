import { NextFunction, Request, Response } from "express";

import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error.js";

import { checkFormdataType } from "../utils/router.util.js";

const checkContentType = (req: Request, _res: Response, next: NextFunction) => {
  if (req.method === "POST" || req.method === "PATCH") {
    const contentType = checkFormdataType(req);
    if (!contentType) throw new UnsupportedMediaTypeError("This API must have a content-type of 'multipart/form-data' or 'application/json' unconditionally.");

    req.contentType = contentType;
    next();
  } else {
    next();
  }
};

export default checkContentType;
