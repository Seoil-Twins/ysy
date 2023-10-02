import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import dayjs from "dayjs";

import { Service } from "./service.js";

import { Calendar } from "../models/calendar.model.js";
import { FilterOptions, ResponseCalendarWithAdmin, PageOptions, SearchOptions } from "../types/calendar.type.js";

import { API_ROOT } from "../index.js";

class CalendarAdminService extends Service {
  private createSort(sort: string): OrderItem {
    let result: OrderItem = ["createdTime", "DESC"];

    switch (sort) {
      case "r":
        result = ["createdTime", "DESC"];
        break;
      case "o":
        result = ["createdTime", "ASC"];
        break;
      case "yr":
        result = ["fromDate", "DESC"];
        break;
      case "yo":
        result = ["fromDate", "ASC"];
        break;
      default:
        result = ["createdTime", "DESC"];
        break;
    }

    return result;
  }

  private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions<Calendar> {
    let result: WhereOptions<Calendar> = {};
    const startDate = dayjs(`${filterOptions.year}-01-01`).startOf("day").formattedHour();
    const endDate = dayjs(`${filterOptions.year}-12-31`).endOf("day").formattedHour();
    result.fromDate = { [Op.between]: [startDate, endDate] };
    result.toDate = { [Op.between]: [startDate, endDate] };

    if (searchOptions.cupId) result.cupId = { [Op.like]: `%${searchOptions.cupId}%` };
    if (filterOptions.fromDate && filterOptions.toDate) result.createdTime = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };
    if (filterOptions.fromClrDate && filterOptions.toClrDate) {
      result.fromDate = { [Op.gte]: dayjs(filterOptions.fromClrDate).utc(true).startOf("day").formattedHour() };
      result.toDate = { [Op.lte]: dayjs(filterOptions.toClrDate).utc(true).endOf("day").formattedHour() };
    }

    return result;
  }

  getURL(cupId: string, fromDate: Date, toDate: Date): string {
    return `${API_ROOT}/admin/calendar/${fromDate.getFullYear()}?cup_id=${cupId}&from_clr_date=${dayjs(fromDate).formattedDate()}&to_clr_date=${dayjs(
      toDate
    ).formattedDate()}`;
  }

  async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseCalendarWithAdmin> {
    const offset: number = (pageOptions.page - 1) * pageOptions.count;
    const sort: OrderItem = this.createSort(pageOptions.sort);
    const where: WhereOptions<Calendar> = this.createWhere(searchOptions, filterOptions);
    const { rows, count }: { rows: Calendar[]; count: number } = await Calendar.findAndCountAll({
      where,
      offset,
      limit: pageOptions.count,
      order: [sort]
    });
    console.log("Where : ", where);
    const result: ResponseCalendarWithAdmin = {
      calendars: rows,
      total: count
    };

    return result;
  }

  async selectAll(calendarIds: number[]): Promise<Calendar[]> {
    const calendars: Calendar[] = await Calendar.findAll({ where: { calendarId: calendarIds } });
    return calendars;
  }

  create(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  update(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async deleteAll(transaction: Transaction | null = null, calendarIds: number[]): Promise<void> {
    await Calendar.destroy({ where: { calendarId: calendarIds } });
  }
}

export default CalendarAdminService;
