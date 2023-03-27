import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import logger from "../logger/logger";
import validator from "../util/validator.util";
import { STATUS_CODE } from "../constant/statusCode.constant";

import AuthController from "../controller/auth.controller";

import BadRequestError from "../error/badRequest.error";
import UnauthorizedError from "../error/unauthorized.error";

import AuthService from "../service/auth.service";
import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";

import { ILogin, ITokenResponse } from "../model/auth.model";

const router: Router = express.Router();
const authService = new AuthService();
const userService = new UserService();
const userRoleService = new UserRoleService();
const authController = new AuthController(authService, userService, userRoleService);

const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/;

const loginSchema: joi.Schema = joi.object({
    email: joi.string().trim().email().required(),
    password: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)).required()
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    const { error }: ValidationResult = validator(req.body, loginSchema);

    try {
        if (error) throw new BadRequestError(error.message);

        const data: ILogin = {
            email: req.body.email,
            password: req.body.password
        };

        const result: ITokenResponse = await authController.login(data);

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
