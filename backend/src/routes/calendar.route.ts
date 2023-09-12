import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import CalendarController from "../controller/calendar.controller";
import CalendarService from "../services/calendar.service";
import CoupleService from "../services/couple.service";

import logger from "../logger/logger";
import validator from "../utils/validator.util";
import { STATUS_CODE } from "../constants/statusCode.constant";

import BadRequestError from "../errors/badRequest.error";
import ForbiddenError from "../errors/forbidden.error";
import UnauthorizedError from "../errors/unauthorized.error";
import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error";

import { Calendar } from "../models/calendar.model";
import { CreateCalendar, UpdateCalendar } from "../types/calendar.type";
import { ContentType } from "../utils/router.util";

const router: Router = express.Router();
const calendarService: CalendarService = new CalendarService();
const coupleService: CoupleService = new CoupleService();
const calendarController: CalendarController = new CalendarController(calendarService, coupleService);

const postSchema: joi.Schema = joi
  .object({
    title: joi.string().required(),
    description: joi.string().required(),
    fromDate: joi.date().required(),
    toDate: joi.date().greater(joi.ref("fromDate")).required(),
    color: joi.string().required().default("#000000")
  })
  .with("fromDate", "toDate")
  .with("toDate", "fromDate");

const updateSchema: joi.Schema = joi
  .object({
    title: joi.string(),
    description: joi.string(),
    fromDate: joi.date(),
    toDate: joi.date().greater(joi.ref("fromDate")),
    color: joi.string()
  })
  .with("fromDate", "toDate")
  .with("toDate", "fromDate");

router.get("/:cup_id/:year", async (req: Request, res: Response, next: NextFunction) => {
  const reqCupId: string | null = req.cupId;
  const year: number = Number(req.params.year);

  try {
    if (reqCupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (!reqCupId) throw new UnauthorizedError("Invalid Token");
    else if (isNaN(year) || req.params.year.length !== 4) throw new BadRequestError("Year must be a number type and 4 length");

    const results: Calendar[] = await calendarController.getCalendars(reqCupId, year);

    logger.debug(`Response Data ${JSON.stringify(results)}`);
    res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const { value, error }: ValidationResult = validator(req.body, postSchema);

  try {
    const cupId: string | null = req.cupId;

    if (contentType === "form-data") throw new UnsupportedMediaTypeError("This API must have a content-type of 'application/json' unconditionally.");
    else if (error) throw new BadRequestError(error.message);
    else if (!cupId) throw new UnauthorizedError("Invalid Token");
    else if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

    const data: CreateCalendar = {
      title: value.title,
      description: value.description,
      fromDate: value.fromDate,
      toDate: value.toDate,
      color: value.color
    };

    const url: string = await calendarController.addCalendar(cupId, data);
    res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
  } catch (error) {
    next(error);
  }
});

router.patch("/:cup_id/:calendar_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const calendarId: number = Number(req.params.calendar_id);
  const { value, error }: ValidationResult = validator(req.body, updateSchema);

  try {
    const cupId: string | null = req.cupId;

    if (contentType === "form-data") throw new UnsupportedMediaTypeError("This API must have a content-type of 'application/json' unconditionally.");
    else if (error) throw new BadRequestError(error.message);
    else if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (!cupId) throw new UnauthorizedError("Invalid Token");
    else if (isNaN(calendarId)) throw new BadRequestError("Calendar ID must be a number type");

    const data: UpdateCalendar = {
      title: value.title ? value.title : undefined,
      description: value.description ? value.description : undefined,
      fromDate: value.fromDate ? value.fromDate : undefined,
      toDate: value.toDate ? value.toDate : undefined,
      color: value.color ? value.color : undefined
    };
    const updatedCalendar: Calendar = await calendarController.updateCalendar(calendarId, data);
    res.status(STATUS_CODE.OK).json(updatedCalendar);
  } catch (error) {
    next(error);
  }
});

router.delete("/:cup_id/:calendar_id", async (req: Request, res: Response, next: NextFunction) => {
  const calendarId: number = Number(req.params.calendar_id);

  try {
    const cupId: string | null = req.cupId;
    if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (!cupId) throw new UnauthorizedError("Invalid Token");
    else if (isNaN(calendarId)) throw new BadRequestError("Calendar ID must be a number type");

    await calendarController.deleteCalendar(calendarId);
    res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
