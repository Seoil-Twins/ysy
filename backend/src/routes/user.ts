import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable, { File } from "formidable";

import { ICreate, IUpdate, IUserResponse } from "../model/user.model";

import UserController from "../controller/user.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";
import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";
import { boolean } from "boolean";

const router: Router = express.Router();
const userService = new UserService();
const userRoleService = new UserRoleService();
const userController = new UserController(userService, userRoleService);

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

// Get My Info
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.body.userId);

    try {
        if (isNaN(userId)) throw new BadRequestError("User ID must be a number type");
        const result: IUserResponse = await userController.getUser(userId);

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
        if (isNaN(userId)) throw new BadRequestError("User ID must be a number type");
        const result: IUserResponse = await userController.getUser(userId);

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
        if (error) throw new BadRequestError(error.message);

        const data: ICreate = {
            snsId: req.body.snsId,
            name: req.body.name,
            email: req.body.email,
            birthday: new Date(req.body.birthday),
            password: req.body.password,
            phone: req.body.phone,
            eventNofi: boolean(req.body.eventNofi)
        };

        await userController.createUser(data);

        return res.status(StatusCode.CREATED).json({});
    } catch (error) {
        next(error);
    }
});

// Update User Info
router.patch("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, updateSchema);

            if (req.params.user_id != req.body.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID");
            else if (error) throw new BadRequestError(error.message);
            else if (!value.name && value.dateNofi === undefined && value.primaryNofi === undefined && value.eventNofi && !value.file)
                throw new BadRequestError("Bad Request Error");
            else if (value.name && value.name.length <= 1) throw new BadRequestError("Bad Request Error");
            else if (files.file instanceof Array<formidable.File>) throw new BadRequestError("You must request only one profile");

            const data: IUpdate = {
                userId: value.userId,
                name: value.password,
                profile: undefined,
                primaryNofi: value.primaryNofi,
                dateNofi: value.dateNofi,
                eventNofi: value.eventNofi
            };
            const file: File | undefined = files.file;

            await userController.updateUser(data, file);

            return res.status(204).json({});
        } catch (error) {
            next(error);
        }
    });
});

// Delete User Info
router.delete("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.body.userId);

    try {
        // Couple 정보를 삭제 후 요청
        if (req.body.cupId) throw new BadRequestError("Bad Request Error");
        else if (req.params.user_id != req.body.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID");
        else if (isNaN(userId)) throw new BadRequestError(`User ID must be a number type`);

        await userController.deleteUser(userId);

        return res.status(204).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
