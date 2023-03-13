import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import inquireController from "../controller/inquire.controller";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import { ICreate, IUpdate } from "../model/inquire.model";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";

const router: Router = express.Router();

const postSchema: joi.Schema = joi.object({
    title: joi.string().required(),
    contents: joi.string().required()
});

const updateSchema: joi.Schema = joi.object({
    title: joi.string(),
    contents: joi.string()
});

router.get("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.params.user_id);

    try {
        if (userId !== req.body.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID");

        const results = await inquireController.getInquires(userId);
        return res.status(StatusCode.OK).json(results);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });

    form.parse(req, async (err, fields, files) => {
        if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

        req.body = Object.assign({}, req.body, fields);
        const inquireData: ICreate = {
            userId: req.body.userId,
            title: String(fields.title),
            contents: String(fields.contents)
        };
        const { value, error }: ValidationResult = validator(req.body, postSchema);

        try {
            if (error) throw new BadRequestError(error.message);

            await inquireController.addInquire(inquireData, files.file);

            res.status(StatusCode.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.patch("/:inquire_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });
    const inquireId = Number(req.params.inquire_id);

    form.parse(req, async (err, fields, files) => {
        if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
        else if (isNaN(inquireId)) throw new BadRequestError("Inquire ID must be a number type");

        req.body = Object.assign({}, req.body, fields);
        const inquireData: IUpdate = {
            inquireId: inquireId,
            title: fields.title ? String(fields.title) : undefined,
            contents: fields.contents ? String(fields.contents) : undefined
        };
        const { value, error }: ValidationResult = validator(req.body, updateSchema);

        try {
            if (error) throw new BadRequestError(error.message);
            else if (!inquireData.title && !inquireData.contents && !files.file) throw new BadRequestError("Request values is empty");

            await inquireController.updateInquire(inquireData, files.file);

            res.status(StatusCode.NO_CONTENT).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:inquire_id", async (req: Request, res: Response, next: NextFunction) => {
    const inquireId = Number(req.params.inquire_id);

    try {
        if (isNaN(inquireId)) throw new BadRequestError("Inquire ID must be a number type");

        await inquireController.deleteInquire(inquireId);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
