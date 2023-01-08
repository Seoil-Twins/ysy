import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import authController from "../controller/auth.controller";

import BadRequestError from "../error/badRequest";

const router: Router = express.Router();

const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/;

const loginSchema: joi.Schema = joi.object({
    email: joi.string().trim().email().required(),
    password: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)).required()
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, loginSchema);

    try {
        if (error) throw new BadRequestError("Bad Request Error");

        const result = await authController.login(value);

        return res.status(StatusCode.OK).json(result);
    } catch (_error) {
        next(_error);
    }
});

export default router;
