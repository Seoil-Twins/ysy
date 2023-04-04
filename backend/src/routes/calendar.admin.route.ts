import dayjs from "dayjs";
import express, { Router, Request, Response, NextFunction } from "express";

import CalendarService from "../service/calendar.service";
import CalendarAdminService from "../service/calendar.admin.service";
import CalendarAdminController from "../controller/calendar.admin.controller";

import { FilterOptions, ICalendarResponseWithCount, SearchOptions } from "../model/calendar.model";
import { PageOptions } from "../model/album.model";

import { canView } from "../util/checkRole.util";
import { STATUS_CODE } from "../constant/statusCode.constant";

const router: Router = express.Router();
const calendarService: CalendarService = new CalendarService();
const calendarAdminService: CalendarAdminService = new CalendarAdminService();
const calendarAdminController: CalendarAdminController = new CalendarAdminController(calendarService, calendarAdminService);

router.get("/:year", canView, async (req: Request, res: Response, next: NextFunction) => {
    let year: number = Number(req.params.year);
    if (isNaN(year) || req.params.year.length !== 4) year = dayjs().year();

    try {
        const pageOptions: PageOptions = {
            count: Number(req.query.count) || 10,
            page: Number(req.query.page) || 1,
            sort: String(req.query.sort) || "r"
        };
        const searchOptions: SearchOptions = {
            cupId: req.query.cup_id ? String(req.query.cup_id) : undefined
        };
        const filterOptions: FilterOptions = {
            year: year,
            fromDate: req.query.from_date ? dayjs(String(req.query.from_date)).startOf("day").toDate() : undefined,
            toDate: req.query.to_date ? dayjs(String(req.query.to_date)).endOf("day").utc(true).toDate() : undefined,
            fromClrDate: req.query.from_clr_date ? dayjs(String(req.query.from_clr_date)).endOf("day").utc(true).toDate() : undefined,
            toClrDate: req.query.to_clr_date ? dayjs(String(req.query.to_clr_date)).endOf("day").utc(true).toDate() : undefined
        };

        console.log(filterOptions);

        const result: ICalendarResponseWithCount = await calendarAdminController.getCalendars(pageOptions, searchOptions, filterOptions);

        res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
