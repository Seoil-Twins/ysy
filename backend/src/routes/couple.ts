import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import coupleController from "../controller/couple.controller";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";

import { ICoupleResponse } from "../model/couple.model";
import InternalServerError from "../error/internalServer";

const router: Router = express.Router();

const signupSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    userId2: joi.number().required(),
    title: joi.string().required(),
    cupDay: joi.date().required()
});

const updateSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    cupId: joi.string().required(),
    title: joi.string(),
    cupDay: joi.date()
});

// const deleteSchema: joi.Schema = joi.object({
//     userId: joi.number().required()
// });

// Get Couple Info
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number(req.body.userId);

        if (isNaN(userId)) throw new BadRequestError("Invalid User Id");
        const response: ICoupleResponse = await coupleController.getCouple(userId);

        return res.status(StatusCode.OK).json(response);
    } catch (_error) {
        next(_error);
    }
});

// Signup Couple
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new err();

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, signupSchema);

            if (error) throw new BadRequestError("Bad Request Error");
            if (Object.keys(files).length === 1) req.body.thumbnail = files.file;

            await coupleController.createCouple(req.body);

            return res.status(StatusCode.CREATED).json({});
        } catch (_error) {
            next(_error);
        }
    });
});

// Update Couple Info
router.patch("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });
    req.body.cupId = req.params.cup_id;

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError("Image Server Error");

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, updateSchema);

            console.log(error);

            if (error) throw new BadRequestError("Bad Request Error");
            if (Object.keys(files).length === 1) req.body.thumbnail = files.file;

            await coupleController.updateCouple(req.body);

            return res.status(204).json({});
        } catch (_error) {
            next(_error);
        }
    });
});

// Delete Couple
router.delete("/", async (req: Request, res: Response, next: NextFunction) => {});

export default router;
