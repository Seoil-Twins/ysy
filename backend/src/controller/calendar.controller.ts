import dayjs from "dayjs";

import NotFoundError from "../error/notFound";

import { Couple } from "../model/couple.model";
import { Calendar, ICreate, IUpdate, IResponse } from "../model/calendar.model";

import logger from "../logger/logger";

import CalendarService from "../service/Calendar.service";
import CoupleService from "../service/couple.service";

dayjs().locale("ko");

class CalendarController {
    private calendarService: CalendarService;
    private coupleService: CoupleService;

    constructor(calendarService: CalendarService, coupleService: CoupleService) {
        this.calendarService = calendarService;
        this.coupleService = coupleService;
    }

    async getCalendars(cupId: string, year: number): Promise<IResponse> {
        const startDate = dayjs(`${year}-01-01`).format("YYYY-MM-DD HH:mm:ss");
        const endDate = dayjs(`${year}-12-31`).format("YYYY-MM-DD HH:mm:ss");

        const calendars: Calendar[] = await this.calendarService.selectAll(cupId, startDate, endDate);
        if (calendars.length <= 0) throw new NotFoundError(`Not found calendar using query parameter cupId => ${cupId}, year => ${year}`);

        const result: IResponse = {
            cupId: cupId,
            calendars: calendars
        };

        return result;
    }

    async addCalendar(data: ICreate): Promise<string> {
        const couple: Couple | null = await this.coupleService.selectByPk(data.cupId);
        if (!couple) throw new NotFoundError(`Not found calendar using query parameter cupId => ${data.cupId}`);

        await this.calendarService.create(null, data);
        logger.debug(`Add Calendar => ${JSON.stringify(data)}`);

        const url: string = `http://localhost:3000/calendar/${data.cupId}/${data.fromDate.getFullYear()}`;
        return url;
    }

    async updateCalendar(calendarId: number, data: IUpdate): Promise<Calendar> {
        const calendar: Calendar | null = await this.calendarService.select(calendarId);
        if (!calendar) throw new NotFoundError(`Not found calendar using query parameter calendarId => ${calendarId}`);

        const updatedCalendar: Calendar = await this.calendarService.update(null, calendar, data);
        logger.debug(`Update Calendar => ${JSON.stringify(updatedCalendar.dataValues)}`);

        return updatedCalendar;
    }

    async deleteCalendar(calendarId: number): Promise<void> {
        const calendar: Calendar | null = await this.calendarService.select(calendarId);
        if (!calendar) throw new NotFoundError(`Not found calendar using query parameter calendarId => ${calendarId}`);

        await this.calendarService.delete(null, calendar);
        logger.debug(`Delete Calendar => ${JSON.stringify(calendar.dataValues)}`);
    }
}

export default CalendarController;
