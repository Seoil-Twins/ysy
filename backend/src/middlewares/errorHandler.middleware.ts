import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

import AbstractError from "../errors/abstract.error.js";
import logger from "../logger/logger.js";

import { ERROR_CODE, STATUS_CODE } from "../constants/statusCode.constant.js";

const globalErrorHandler: ErrorRequestHandler = (e: any, req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${e}`);

  if (e instanceof AbstractError) {
    const { message, statusCode } = e;
    res.status(statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      type: e.name,
      message: message,
      statusCode: e.statusCode,
      errorCode: e.errorCode
    });
  } else {
    logger.error(`Server Error : ${JSON.stringify(e)} ${e.stack}`);

    if (e.status && e.status === 400) {
      const { status, body } = e;
      res.status(status || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        type: e.name,
        message: body,
        statusCode: e.status,
        errorCode: e.status
      });
    } else {
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        type: "Internal Server Error",
        message: "Unknown Error",
        statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
        errorCode: ERROR_CODE.INTERNAL_SERVER_ERROR
      });
    }
  }
};

export default globalErrorHandler;
