import { Op, Transaction } from "sequelize";

import { API_ROOT } from "..";

import { Calendar, ICreate, IUpdate } from "../models/calendar.model";
import { Couple } from "../models/couple.model";

import { Service } from "./service";

class CalendarService extends Service {
    getURL(cupId: string, year: number): string {
        return `${API_ROOT}/calendar/${cupId}/${year}`;
    }

    async select(calendarId: number): Promise<Calendar | null> {
        const calendar: Calendar | null = await Calendar.findOne({
            where: { calendarId }
        });

        return calendar;
    }

    async selectAll(cupId: string, startDate: string, endDate: string): Promise<Calendar[]> {
        const calendars: Calendar[] = await Calendar.findAll({
            attributes: { exclude: ["cupId"] },
            where: {
                cupId,
                fromDate: { [Op.between]: [startDate, endDate] },
                toDate: { [Op.between]: [startDate, endDate] }
            }
        });

        return calendars;
    }

    async selectWithCouple(couple: Couple): Promise<Calendar[]> {
        const calendars: Calendar[] = await couple.getCalendars();
        return calendars;
    }

    async create(transaction: Transaction | null = null, data: ICreate): Promise<Calendar> {
        const createdCalendar: Calendar = await Calendar.create(data, { transaction });
        return createdCalendar;
    }

    async update(transaction: Transaction | null = null, calendar: Calendar, data: IUpdate): Promise<Calendar> {
        const updatedCalendar: Calendar = await calendar.update(data, { transaction });
        return updatedCalendar;
    }

    async delete(transaction: Transaction | null = null, calendar: Calendar): Promise<any> {
        await calendar.destroy({ transaction });
    }

    async deleteAll(transaction: Transaction | null = null, calendarIds: number[]): Promise<any> {
        await Calendar.destroy({ where: { calendarId: calendarIds }, transaction });
    }
}

export default CalendarService;
