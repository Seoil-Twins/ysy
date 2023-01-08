import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import AbstractError from "../error/abstractError";
import StatusCode from "../util/statusCode";

const globalErrorHandler: ErrorRequestHandler = (e: any, req: Request, res: Response, next: NextFunction) => {
    console.log("Error?? : ", e);

    if (e instanceof AbstractError) {
        const { message, statusCode } = e;
        res.status(statusCode || StatusCode.INTERNAL_SERVER_ERROR).json({ message });
    } else {
        // 라이브러리 등 에러 발생시...
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};

export default globalErrorHandler;
