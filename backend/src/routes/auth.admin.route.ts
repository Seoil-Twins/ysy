import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

import BadRequestError from "../errors/badRequest.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";

import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";

import { LoginWithAdmin, ResponseToken } from "../types/auth.type.js";
import AuthAdminService from "../services/auth.admin.service.js";
import AuthAdminController from "../controllers/auth.admin.controller.js";
import AdminService from "../services/admin.service.js";

const router: Router = express.Router();
const authAdminService = new AuthAdminService();
const userService = new UserService();
const userRoleService = new UserRoleService();
const adminService: AdminService = new AdminService();
const authAdminController = new AuthAdminController(authAdminService, userService, userRoleService, adminService);

const loginSchema: joi.Schema = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.string().trim().required()
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const { error }: ValidationResult = validator(req.body, loginSchema);

  try {
    if (error) throw new BadRequestError(error.message);

    const data: LoginWithAdmin = {
      email: req.body.email,
      password: req.body.password
    };

    const result: ResponseToken = await authAdminController.login(data);

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

    const result = await authAdminController.updateToken(accessToken, refreshToken);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
