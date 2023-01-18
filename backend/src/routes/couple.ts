import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import coupleController from "../controller/couple.controller";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";

const router: Router = express.Router();

const signupSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    userId2: joi.number().required(),
    title: joi.string().required(),
    cupDay: joi.date().required()
});

// const updateSchema: joi.Schema = joi.object({
//     userId: joi.number().required(),
//     name: joi.string().max(8).trim(),
//     profile: joi.string().trim(),
//     primaryNofi: joi.boolean(),
//     dateNofi: joi.boolean(),
//     eventNofi: joi.boolean()
// });

// const deleteSchema: joi.Schema = joi.object({
//     userId: joi.number().required()
// });

// Get Couple Info
router.get("/", async (req: Request, res: Response, next: NextFunction) => {});

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
router.patch("/", async (req: Request, res: Response, next: NextFunction) => {});

// Delete Couple
router.delete("/", async (req: Request, res: Response, next: NextFunction) => {});

export default router;
