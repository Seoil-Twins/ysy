import { Transaction } from "sequelize";

import sequelize from "../models/index.js";
import { Calendar, FilterOptions, ICalendarResponseWithCount, ICreate, PageOptions, SearchOptions } from "../models/calendar.model.js";
import { Couple } from "../models/couple.model.js";

import CoupleService from "../services/couple.service.js";
import CalendarService from "../services/calendar.service.js";
import CalendarAdminService from "../services/calendar.admin.service.js";

import NotFoundError from "../errors/notFound.error.js";
import BadRequestError from "../errors/badRequest.error.js";

import logger from "../logger/logger.js";

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
