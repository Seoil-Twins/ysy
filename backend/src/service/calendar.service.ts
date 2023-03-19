import dayjs from "dayjs";
import { Op, Transaction } from "sequelize";

import { Calendar, ICreate, IUpdate } from "../model/calendar.model";

import { Service } from "./service";

class CalendarService implements Service {
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

    async create(transaction: Transaction | null = null, data: ICreate): Promise<void> {
        await Calendar.create(data, { transaction });
    }

    async update(transaction: Transaction | null = null, calendar: Calendar, data: IUpdate): Promise<Calendar> {
        const updatedCalendar: Calendar = await calendar.update(data, { transaction });
        return updatedCalendar;
    }

    async delete(transaction: Transaction | null = null, calendar: Calendar): Promise<any> {
        await calendar.destroy({ transaction });
    }
}

export default CalendarService;
