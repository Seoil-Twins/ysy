import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

import AbstractError from "../error/abstractError";
import ConflictError from "../error/conflict";
import logger from "../logger/logger";

import StatusCode from "../util/statusCode";

const globalErrorHandler: ErrorRequestHandler = (e: any, req: Request, res: Response, next: NextFunction) => {
    logger.debug(`Error Handler => ${e}`);

    if (e instanceof AbstractError) {
        const { message, statusCode } = e;
        res.status(statusCode || StatusCode.INTERNAL_SERVER_ERROR).json({ message });
    } else {
        logger.error(`Server Error : ${JSON.stringify(e)}`);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};

export default globalErrorHandler;
