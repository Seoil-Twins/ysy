import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import { IUserResponse } from "../model/user.model";

import userController from "../controller/user.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";

const router: Router = express.Router();

const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/;
const phonePattern = /^[0-9]+$/;
const signupSchema: joi.Schema = joi.object({
    snsId: joi.string().length(4).required(),
    name: joi.string().max(8).trim().required(),
    password: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)).required(),
    email: joi.string().trim().email().required(),
    phone: joi.string().trim().length(11).regex(RegExp(phonePattern)).required(),
    birthday: joi
        .date()
        .greater(new Date("1980-01-01")) // 1980-01-01보다 더 큰 날짜여야 함.
        .less(new Date("2023-12-31")) // 2023-12-31보다 낮은 날짜여야 함.
        .required(),
    eventNofi: joi.bool().default(false)
});

const updateSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    name: joi.string().max(8).trim(),
    primaryNofi: joi.boolean(),
    dateNofi: joi.boolean(),
    eventNofi: joi.boolean()
});

const deleteSchema: joi.Schema = joi.object({
    userId: joi.number().required()
});

// Get My Info
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.body.userId);

    try {
        if (isNaN(userId)) throw new BadRequestError("Invalid User Id");
        const result: IUserResponse = await userController.getUsers(userId);

        logger.debug(`Response Data : ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

// Get User Info
router.get("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.user_id);

    try {
        if (isNaN(userId)) throw new BadRequestError("Invalid User Id");
        const result: IUserResponse = await userController.getUsers(userId);

        logger.debug(`Response Data : ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

// Signup User
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, signupSchema);

    try {
        if (error) throw new BadRequestError("Bad Request Error");
        await userController.createUser(value);

        return res.status(StatusCode.CREATED).json({});
    } catch (error) {
        next(error);
    }
});

// Update User Info
router.patch("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError("Image Server Error");

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, updateSchema);

            if (req.params.user_id != req.body.userId) throw new ForbiddenError("Forbidden Error");
            else if (error) throw new BadRequestError("Bad Request Error");
            else if (!value.name && value.dateNofi === undefined && !value.primaryNofi === undefined && !value.file)
                throw new BadRequestError("Bad Request Error");
            else if (value.name && value.name.length <= 1) throw new BadRequestError("Bad Request Error");

            let file: any = undefined;
            if (Object.keys(files).length === 1) file = files.file;

            logger.debug(`${JSON.stringify(req.body)}`);
            await userController.updateUser(req.body, file);

            return res.status(204).json({});
        } catch (error) {
            next(error);
        }
    });
});

// Delete User Info
router.delete("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, deleteSchema);

    try {
        // Couple 정보를 삭제 후 요청
        if (req.body.cupId) throw new BadRequestError("Bad Request Error");
        else if (req.params.user_id != req.body.userId) throw new ForbiddenError("Forbidden Error");
        else if (error) throw new BadRequestError("Bad Request Error");

        await userController.deleteUser(req.body.userId);

        return res.status(204).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
