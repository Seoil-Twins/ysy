import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import inquireController from "../controller/inquire.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";

import { ICreate as ICreateInquire } from "../model/inquire.model";

const router: Router = express.Router();

const postSchema: joi.Schema = joi.object({
    title: joi.string().required(),
    contents: joi.string().required()
});

const updateSchema: joi.Schema = joi.object({
    title: joi.string(),
    contents: joi.string()
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        if (err) throw new err();

        req.body = Object.assign({}, req.body, fields);
        const inquireData: ICreateInquire = {
            userId: req.body.userId,
            title: String(fields.title),
            contents: String(fields.contents)
        };
        const { value, error }: ValidationResult = validator(req.body, postSchema);

        try {
            if (error) {
                logger.debug(`Bad Request Error => ${JSON.stringify(error)}`);
                throw new BadRequestError("Bad Request Error");
            }

            await inquireController.addInquire(inquireData, files.file);

            res.status(StatusCode.CREATED).json({});
        } catch (_error) {
            next(_error);
        }
    });
});

export default router;
