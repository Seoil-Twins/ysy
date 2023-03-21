import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import CalendarController from "../controller/calendar.controller";
import CalendarService from "../service/calendar.service";
import CoupleService from "../service/couple.service";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";

import { Calendar, IResponse } from "../model/calendar.model";

const router: Router = express.Router();
const calendarService: CalendarService = new CalendarService();
const coupleService: CoupleService = new CoupleService();
const calendarController: CalendarController = new CalendarController(calendarService, coupleService);

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
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(year) || req.params.year.length !== 4) throw new BadRequestError("Year must be a number type and 4 length");

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
        if (error) throw new BadRequestError(error.message);
        else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

        const url: string = await calendarController.addCalendar(value);
        res.header({ Location: url }).status(StatusCode.CREATED).json({});
    } catch (error) {
        next(error);
    }
});

router.patch("/:cup_id/:calendar_id", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, updateSchema);
    const calendarId: number = Number(req.params.calendar_id);

    try {
        if (error) throw new BadRequestError(error.message);
        else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(calendarId)) throw new BadRequestError("Calendar ID must be a number type");

        const updatedCalendar: Calendar = await calendarController.updateCalendar(calendarId, value);
        res.status(StatusCode.OK).json(updatedCalendar);
    } catch (error) {
        next(error);
    }
});

router.delete("/:cup_id/:calendar_id", async (req: Request, res: Response, next: NextFunction) => {
    const calendarId: number = Number(req.params.calendar_id);

    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(calendarId)) throw new BadRequestError("Calendar ID must be a number type");

        await calendarController.deleteCalendar(calendarId);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
