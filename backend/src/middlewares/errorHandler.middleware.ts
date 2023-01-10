import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import AbstractError from "../error/abstractError";
import ConflictError from "../error/conflict";
import StatusCode from "../util/statusCode";

const globalErrorHandler: ErrorRequestHandler = (e: any, req: Request, res: Response, next: NextFunction) => {
    console.log("Error?? : ", e);

    if (e instanceof AbstractError) {
        const { message, statusCode } = e;
        res.status(statusCode || StatusCode.INTERNAL_SERVER_ERROR).json({ message });
    } else if (req.url === "/user" && req.method === "POST" && e.errno === 1062) {
        // 1062 오류가 여러 개의 상황이 중첩되면 else if 안에서 url과 method를 나누기
        const { statusCode, message } = new ConflictError("Duplicated User");
        res.status(statusCode).json({ message });
    } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};

export default globalErrorHandler;
