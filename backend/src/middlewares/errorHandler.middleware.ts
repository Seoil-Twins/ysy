import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

import AbstractError from "../error/abstract.error";
import logger from "../logger/logger";

import { STATUS_CODE } from "../constant/statusCode.constant";

const globalErrorHandler: ErrorRequestHandler = (e: any, req: Request, res: Response, next: NextFunction) => {
    logger.debug(`Error Handler => ${e}`);

    if (e instanceof AbstractError) {
        const { message, statusCode } = e;
        res.status(statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            type: e.name,
            message: message,
            statusCode: e.statusCode
        });
    } else {
        logger.error(`Server Error : ${JSON.stringify(e)} ${e.stack}`);
        res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            type: "Internal Server Error",
            message: "Unknown Error",
            statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR
        });
    }
};

export default globalErrorHandler;
