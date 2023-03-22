import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

import AbstractError from "../error/abstractError";
import logger from "../logger/logger";

import StatusCode from "../util/statusCode";

const globalErrorHandler: ErrorRequestHandler = (e: any, req: Request, res: Response, next: NextFunction) => {
    logger.debug(`Error Handler => ${e}`);

    if (e instanceof AbstractError) {
        const { message, statusCode } = e;
        res.status(statusCode || StatusCode.INTERNAL_SERVER_ERROR).json({
            type: e.name,
            message: message,
            statusCode: e.statusCode
        });
    } else {
        logger.error(`Server Error : ${JSON.stringify(e)} ${e.stack}`);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            type: "Internal Server Error",
            message: "Unknown Error",
            statusCode: StatusCode.INTERNAL_SERVER_ERROR
        });
    }
};

export default globalErrorHandler;
