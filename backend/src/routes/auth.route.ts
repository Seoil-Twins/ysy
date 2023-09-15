import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

import AuthController from "../controller/auth.controller.js";

import BadRequestError from "../errors/badRequest.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";

import AuthService from "../services/auth.service.js";
import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";

import { Login, ResponseToken } from "../types/auth.type.js";

const router: Router = express.Router();
const authService = new AuthService();
const userService = new UserService();
const userRoleService = new UserRoleService();
const authController = new AuthController(authService, userService, userRoleService);

const loginSchema: joi.Schema = joi.object({
  email: joi.string().trim().email().required(),
  snsId: joi.string().trim().required(),
  snsKind: joi.string().length(4).required()
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { error }: ValidationResult = validator(req.body, loginSchema);

  try {
    if (error) throw new BadRequestError(error.message);

    const data: Login = {
      email: req.body.email,
      snsId: req.body.snsId,
      snsKind: req.body.snsKind
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

    if (!accessToken) {
      throw new UnauthorizedError("Not found Access Token");
    } else if (!refreshToken) {
      throw new UnauthorizedError("Not found Refresh Token");
    }

    const result = await authController.updateToken(accessToken, refreshToken);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
