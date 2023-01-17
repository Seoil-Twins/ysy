import { Request, Response, NextFunction } from "express";
import { TokenExpiredError, JsonWebTokenError, JwtPayload } from "jsonwebtoken";

import jwt from "../util/jwt";

import UnauthorizedError from "../error/unauthorized";

const checkToken = (req: Request, res: Response, next: NextFunction) => {
    // 해당 URL은 검증을 하지 않아도 됨.
    if (req.originalUrl === "/user" && req.method === "POST") return next();

    const token = req.header("Authorization");

    if (!token) throw new UnauthorizedError("Not AccessToken");

    try {
        const user: JwtPayload | string = jwt.verify(token);

        if (typeof user === "string") throw new UnauthorizedError("Invalid Token");

        req.body.userId = user.userId;

        return next();
    } catch (error) {
        if (error instanceof TokenExpiredError) throw new UnauthorizedError("Token Expired");
        else if (error instanceof JsonWebTokenError) throw new UnauthorizedError("Invalid Token");
        else throw new UnauthorizedError("Invalid Token");
    }
};

export default checkToken;
