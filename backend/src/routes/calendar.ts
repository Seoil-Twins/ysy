import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import calendarController from "../controller/calendar.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";

const router: Router = express.Router();

const postSchema: joi.Schema = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    fromTime: joi.date().required(),
    toTime: joi.date().required(),
    color: joi.string().required().default("#000000")
});

router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, postSchema);

    try {
        if (error) throw new BadRequestError("Bad Request Error");
        else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Forbidden Error");

        await calendarController.addCalendar(value);
        res.status(StatusCode.CREATED).json({});
    } catch (_error) {
        next(_error);
    }
});

export default router;
