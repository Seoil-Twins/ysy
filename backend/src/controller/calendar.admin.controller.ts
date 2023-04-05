import { Transaction } from "sequelize";

import sequelize from "../model";
import { Calendar, FilterOptions, ICalendarResponseWithCount, ICreate, PageOptions, SearchOptions } from "../model/calendar.model";
import { Couple } from "../model/couple.model";

import CoupleService from "../service/couple.service";
import CalendarService from "../service/calendar.service";
import CalendarAdminService from "../service/calendar.admin.service";

import NotFoundError from "../error/notFound.error";
import BadRequestError from "../error/badRequest.error";

import logger from "../logger/logger";

class CalendarAdminController {
    private coupleService: CoupleService;
    private calendarService: CalendarService;
    private calendarAdminService: CalendarAdminService;

    constructor(coupleService: CoupleService, calendarService: CalendarService, calendarAdminService: CalendarAdminService) {
        this.coupleService = coupleService;
        this.calendarService = calendarService;
        this.calendarAdminService = calendarAdminService;
    }

    async getCalendars(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICalendarResponseWithCount> {
        const result: ICalendarResponseWithCount = await this.calendarAdminService.select(pageOptions, searchOptions, filterOptions);
        if (result.count <= 0) throw new NotFoundError(`Not found calendars`);

        return result;
    }

    async addCalendar(data: ICreate): Promise<string> {
        const couple: Couple | null = await this.coupleService.selectByPk(data.cupId);
        if (!couple) throw new NotFoundError(`Not found calendar using query parameter cupId => ${data.cupId}`);

        const createdCalendar: Calendar = await this.calendarService.create(null, data);
        logger.debug(`Add Calendar => ${JSON.stringify(createdCalendar)}`);

        const url: string = this.calendarAdminService.getURL(data.cupId, createdCalendar.fromDate, createdCalendar.toDate);
        return url;
    }

    async deleteCalendars(calendarIds: number[]): Promise<void> {
        const calendars: Calendar[] = await this.calendarAdminService.selectAll(calendarIds);
        if (calendars.length <= 0) throw new BadRequestError(`Not found calendar with using => ${calendarIds}`);

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            await this.calendarAdminService.deleteAll(transaction, calendarIds);
            await transaction.commit();
        } catch (error) {
            if (transaction) transaction.rollback();
            logger.error(`Calendars delete API error => ${JSON.stringify(error)}`);
            throw error;
        }
    }
}

export default CalendarAdminController;
