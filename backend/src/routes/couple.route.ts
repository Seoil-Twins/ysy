import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable, { File } from "formidable";

import logger from "../logger/logger";
import validator from "../util/validator.util";
import { STATUS_CODE } from "../constant/statusCode.constant";

import InternalServerError from "../error/internalServer.error";
import ForbiddenError from "../error/forbidden.error";
import BadRequestError from "../error/badRequest.error";

import { ITokenResponse } from "../model/auth.model";
import { Couple, IRequestCreate, IUpdateWithController } from "../model/couple.model";

import CoupleController from "../controller/couple.controller";
import CoupleService from "../service/couple.service";
import UserService from "../service/user.service";
import UserRoleService from "../service/userRole.service";

const router: Router = express.Router();
const coupleSerivce = new CoupleService();
const userService = new UserService();
const userRoleService = new UserRoleService();
const coupleController = new CoupleController(coupleSerivce, userService, userRoleService);

const signupSchema: joi.Schema = joi.object({
    userId2: joi.number().required(),
    title: joi.string().required(),
    cupDay: joi.date().required()
});

const updateSchema: joi.Schema = joi.object({
    title: joi.string(),
    cupDay: joi.date()
});

// Get Couple Info
router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.body.userId);
        const cupId = req.body.cupId;

        if (isNaN(userId)) throw new BadRequestError("User ID must be a number type");
        else if (!cupId) throw new ForbiddenError("You must request couple ID");
        else if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

        const result: Couple = await coupleController.getCouple(cupId);

        logger.debug(`Response Data : ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

// Create Couple
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, signupSchema);
            const file: File | undefined = !(files.file instanceof Array<formidable.File>) ? files.file : undefined;

            if (error) throw new BadRequestError(error.message);

            const data: IRequestCreate = {
                userId: value.userId,
                userId2: value.userId2,
                cupDay: value.cupDay,
                title: value.title
            };

            const [result, url]: [ITokenResponse, string] = await coupleController.createCouple(data, file);

            logger.debug(`Response Data : ${JSON.stringify(result)}`);
            return res.header({ Location: url }).status(STATUS_CODE.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    });
});

// Update Couple Info
router.patch("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, updateSchema);
            const file: File | undefined = !(files.file instanceof Array<formidable.File>) ? files.file : undefined;

            if (error) throw new BadRequestError(error.message);
            else if (!file && !req.body.title && !req.body.cupDay) throw new BadRequestError("Request values is empty");
            else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

            const data: IUpdateWithController = {
                userId: value.userId,
                cupId: value.cupId,
                cupDay: value.cupDay,
                title: value.title
            };

            const couple: Couple = await coupleController.updateCouple(data, file);

            return res.status(STATUS_CODE.OK).json(couple);
        } catch (error) {
            next(error);
        }
    });
});

// Delete Couple
router.delete("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.body.userId);
        const cupId = req.body.cupId;

        if (isNaN(userId)) throw new BadRequestError("User ID must be a number type");
        else if (!cupId) throw new ForbiddenError("You must request couple ID");
        else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

        const result: ITokenResponse = await coupleController.deleteCouple(userId, cupId);

        logger.debug(`Response Data : ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
