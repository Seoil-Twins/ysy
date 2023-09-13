import dayjs from "dayjs";

import NotFoundError from "../errors/notFound.error";

import { Couple } from "../models/couple.model";
import { Calendar } from "../models/calendar.model";
import { CreateCalendar, UpdateCalendar } from "../types/calendar.type";

import logger from "../logger/logger";

import CalendarService from "../services/calendar.service";
import CoupleService from "../services/couple.service";

class CalendarController {
  private calendarService: CalendarService;
  private coupleService: CoupleService;

  constructor(calendarService: CalendarService, coupleService: CoupleService) {
    this.calendarService = calendarService;
    this.coupleService = coupleService;
  }

  async getCalendars(cupId: string, year: number): Promise<Calendar[]> {
    const startDate = dayjs(`${year}-01-01 00:00:00`).startOf("day").formattedHour();
    const endDate = dayjs(`${year}-12-31 11:59:59`).endOf("day").formattedHour();

    const calendars: Calendar[] = await this.calendarService.selectAll(cupId, startDate, endDate);
    return calendars;
  }

  async addCalendar(data: CreateCalendar): Promise<string> {
    const couple: Couple | null = await this.coupleService.select(data.cupId);
    if (!couple) throw new NotFoundError(`Not found calendar using query parameter cupId => ${data.cupId}`);

    const createdCalendar: Calendar = await this.calendarService.create(null, data);
    logger.debug(`Add Calendar => ${JSON.stringify(data)}`);

    const url: string = this.calendarService.getURL(createdCalendar.cupId, createdCalendar.fromDate.getFullYear());
    return url;
  }

  async updateCalendar(calendarId: number, data: UpdateCalendar): Promise<Calendar> {
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
