import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import calendarController from "../controller/calendar.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";

import { IUpdate, IResponse } from "../model/calendar.model";

const router: Router = express.Router();

const postSchema: joi.Schema = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    fromDate: joi.date().required(),
    toDate: joi.date().required(),
    color: joi.string().required().default("#000000")
});

const updateSchema: joi.Schema = joi
    .object({
        title: joi.string(),
        description: joi.string(),
        fromDate: joi.date(),
        toDate: joi.date(),
        color: joi.string()
    })
    .with("fromDate", "toDate")
    .with("toDate", "fromDate");

router.get("/:cup_id/:year", async (req: Request, res: Response, next: NextFunction) => {
    const reqCupId: string = req.params.cup_id;
    const year: number = Number(req.params.year);

    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Forbidden Error");
        else if (isNaN(year) || req.params.year.length !== 4) throw new BadRequestError("Bad Request");

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
    } catch (error) {
        next(error);
    }
});

router.patch("/:cup_id/:calendar_id", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, updateSchema);
    const calendarId: number = Number(req.params.calendar_id);

    try {
        if (error) {
            logger.debug(`Bad Request Error => ${JSON.stringify(error)}`);
            throw new BadRequestError("Bad Request Error");
        } else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Forbidden Error");
        else if (isNaN(calendarId)) throw new BadRequestError("Bad Request Error");

        await calendarController.updateCalendar(calendarId, value);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

router.delete("/:cup_id/:calendar_id", async (req: Request, res: Response, next: NextFunction) => {
    const calendarId: number = Number(req.params.calendar_id);

    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Forbidden Error");
        else if (isNaN(calendarId)) throw new BadRequestError("Bad Request Error");

        await calendarController.deleteCalendar(calendarId);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
