import { Request, Response, NextFunction } from "express";
import pkg, { JwtPayload } from "jsonwebtoken";
import UnauthorizedError from "../errors/unauthorized.error.js";

import logger from "../logger/logger.js";
import jwt from "../utils/jwt.util.js";

const { TokenExpiredError, JsonWebTokenError } = pkg;

const checkToken = (req: Request, _res: Response, next: NextFunction) => {
  // 해당 URL은 검증을 하지 않아도 됨.
  if (req.originalUrl === "/user" && req.method === "POST") return next();

  const token = req.header("Authorization");

  if (!token) throw new UnauthorizedError("Not AccessToken");

  try {
    const user: JwtPayload | string = jwt.verify(token);

    console.log(token);

    if (typeof user === "string") throw new UnauthorizedError("Invalid Token");
    req.userId = Number(user.userId);
    req.cupId = user.cupId;
    req.roleId = Number(user.roleId);

    if (isNaN(req.userId) || isNaN(req.roleId)) throw new UnauthorizedError("Invalid Token");

    logger.debug(`Authorization : ${JSON.stringify(user)}`);

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) throw new UnauthorizedError("Token Expired");
    else if (error instanceof JsonWebTokenError) throw new UnauthorizedError("Invalid Token");
    else throw new UnauthorizedError("Invalid Token");
  }
};

export default checkToken;
