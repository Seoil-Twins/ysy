import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import calendarController from "../controller/calendar.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";

import { IResponse } from "../model/calendar.model";

const router: Router = express.Router();

const postSchema: joi.Schema = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    fromDate: joi.date().required(),
    toDate: joi.date().required(),
    color: joi.string().required().default("#000000")
});

router.get("/:cup_id/:year", async (req: Request, res: Response, next: NextFunction) => {
    const reqCupId: string = req.params.cup_id;
    const year: number = Number(req.params.year);

    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Forbidden Error");
        else if (isNaN(year)) throw new BadRequestError("Bad Request");

        const results: IResponse = await calendarController.getCalendars(reqCupId, year);

        logger.debug(`Response Data ${JSON.stringify(results)}`);
        res.status(StatusCode.OK).json(results);
    } catch (error) {
        next(error);
    }
});

router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, postSchema);

    try {
        if (error) {
            logger.debug(`Bad Request Error => ${JSON.stringify(error)}`);
            throw new BadRequestError("Bad Request Error");
        } else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Forbidden Error");

        await calendarController.addCalendar(value);
        res.status(StatusCode.CREATED).json({});
    } catch (_error) {
        next(_error);
    }
});

export default router;
