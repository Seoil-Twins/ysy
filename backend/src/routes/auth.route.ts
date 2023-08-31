import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import logger from "../logger/logger";
import validator from "../utils/validator.util";
import { STATUS_CODE } from "../constant/statusCode.constant";

import AuthController from "../controller/auth.controller";

import BadRequestError from "../errors/badRequest.error";
import UnauthorizedError from "../errors/unauthorized.error";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import UserRoleService from "../services/userRole.service";

import { Login, ResponseToken } from "../types/auth.type";

const router: Router = express.Router();
const authService = new AuthService();
const userService = new UserService();
const userRoleService = new UserRoleService();
const authController = new AuthController(authService, userService, userRoleService);

const loginSchema: joi.Schema = joi.object({
  email: joi.string().trim().email().required(),
  snsId: joi.string().trim().required()
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { error }: ValidationResult = validator(req.body, loginSchema);

  try {
    if (error) throw new BadRequestError(error.message);

    const data: Login = {
      email: req.body.email,
      snsId: req.body.snsId
    };

    const result: ResponseToken = await authController.login(data);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.header("Authorization");
    const refreshToken = req.header("Refresh");

    if (!accessToken || !refreshToken) throw new UnauthorizedError("Invalid Token");

    const result = await authController.updateToken(accessToken, refreshToken);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
