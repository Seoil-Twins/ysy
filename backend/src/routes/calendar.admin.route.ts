import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";

import CoupleService from "../services/couple.service";
import CalendarService from "../services/calendar.service";
import CalendarAdminService from "../services/calendar.admin.service";
import CalendarController from "../controller/calendar.controller";
import CalendarAdminController from "../controller/calendar.admin.controller";

import { Calendar, FilterOptions, ICalendarResponseWithCount, ICreate, IUpdate, SearchOptions } from "../models/calendar.model";
import { PageOptions } from "../models/album.model";

import validator from "../utils/validator.util";
import { canModifyWithEditor, canView } from "../utils/checkRole.util";
import { STATUS_CODE } from "../constants/statusCode.constant";

import BadRequestError from "../errors/badRequest.error";

const router: Router = express.Router();
const coupleService: CoupleService = new CoupleService();
const calendarService: CalendarService = new CalendarService();
const calendarAdminService: CalendarAdminService = new CalendarAdminService();
const calendarAdminController: CalendarAdminController = new CalendarAdminController(coupleService, calendarService, calendarAdminService);
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

router.get("/:year", canView, async (req: Request, res: Response, next: NextFunction) => {
  let year: number = Number(req.params.year);
  if (isNaN(year) || req.params.year.length !== 4) year = dayjs().year();

  try {
    const count: number = Number(req.query.count);
    const page: number = Number(req.query.page);
    const pageOptions: PageOptions = {
      count: !isNaN(count) ? count : 10,
      page: !isNaN(page) ? page : 1,
      sort: req.query.sort ? String(req.query.sort) : "r"
    };
    const searchOptions: SearchOptions = {
      cupId: req.query.cup_id ? String(req.query.cup_id) : undefined
    };
    const filterOptions: FilterOptions = {
      year: year,
      fromDate: req.query.from_date ? dayjs(String(req.query.from_date)).startOf("day").utc(true).toDate() : undefined,
      toDate: req.query.to_date ? dayjs(String(req.query.to_date)).endOf("day").utc(true).toDate() : undefined,
      fromClrDate: req.query.from_clr_date ? dayjs(String(req.query.from_clr_date)).startOf("day").utc(true).toDate() : undefined,
      toClrDate: req.query.to_clr_date ? dayjs(String(req.query.to_clr_date)).endOf("day").utc(true).toDate() : undefined
    };

    const result: ICalendarResponseWithCount = await calendarAdminController.getCalendars(pageOptions, searchOptions, filterOptions);

    res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/:cup_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const { value, error }: ValidationResult = validator(req.body, postSchema);

  try {
    if (error) throw new BadRequestError(error.message);

    const data: ICreate = {
      cupId: req.params.cup_id,
      title: value.title,
      description: value.description,
      fromDate: value.fromDate,
      toDate: value.toDate,
      color: value.color
    };

    const url: string = await calendarAdminController.addCalendar(data);
    res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
  } catch (error) {
    next(error);
  }
});

router.patch("/:cup_id/:calendar_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const { value, error }: ValidationResult = validator(req.body, updateSchema);
  const calendarId: number = Number(req.params.calendar_id);

  try {
    if (error) throw new BadRequestError(error.message);
    else if (isNaN(calendarId)) throw new BadRequestError("Calendar ID must be a number type");

    const data: IUpdate = {
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

router.delete("/:calendar_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const calendarIds: number[] = req.params.calendar_ids.split(",").map(Number);
  const numCalendarIds: number[] = calendarIds.filter((calendarId: number) => {
    if (!isNaN(calendarId)) return calendarId;
  });

  try {
    if (!numCalendarIds || numCalendarIds.length <= 0) throw new BadRequestError("Calendar ID must be a number type");

    await calendarAdminController.deleteCalendars(numCalendarIds);
    res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
