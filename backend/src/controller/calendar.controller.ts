import dayjs from "dayjs";
import { Op } from "sequelize";

import NotFoundError from "../error/notFound";

import { Couple } from "../model/couple.model";
import { Calendar, ICreate, IUpdate, IResponse } from "../model/calendar.model";

import logger from "../logger/logger";
const controller = {
    /**
     * 해당년도에 커플 캘린더를 가져옵니다.
     * @param cupId Couple Id
     * @param year 검색할 년도 (1월부터 12월까지)
     * @returns Return {@link Calendar `Calendar[]`}
     */
    getCalendars: async (cupId: string, year: number): Promise<IResponse> => {
        const startDate = dayjs(`${year}-01-01`).format("YYYY-MM-DD HH:mm:ss");
        const endDate = dayjs(`${year}-12-31`).format("YYYY-MM-DD HH:mm:ss");

        const calendars: Calendar[] = await Calendar.findAll({
            attributes: { exclude: ["cupId"] },
            where: {
                cupId: cupId,
                fromDate: { [Op.between]: [startDate, endDate] }
            }
        });

        if (calendars.length <= 0) throw new NotFoundError("Not Found Data");

        const result: IResponse = {
            cupId: cupId,
            calendars: calendars
        };

        return result;
    },
    /**
     * 커플 캘린더 일정을 추가합니다.
     * @param data Calendar를 넣기 위한 데이터입니다.
     */
    addCalendar: async (data: ICreate): Promise<void> => {
        const couple: Couple | null = await Couple.findByPk(data.cupId);

        if (!couple) throw new NotFoundError(`Not Found Couple to Couple Id ${data.cupId}`);

        await Calendar.create(data);
        logger.debug(`Add Calendar => ${JSON.stringify(data)}`);
    },
    /**
     * 커플 캘린더 일정을 변경합니다.
     * @param userId User Id
     * @param calendarId Calendar ID
     * @param data A {@link IRequestUpdate}
     */
    updateCalendar: async (calendarId: number, data: IUpdate): Promise<void> => {
        const calendar: Calendar | null = await Calendar.findByPk(calendarId);

        if (!calendar) throw new NotFoundError(`Not Found Calendar to Calendar Id ${calendarId}`);

        await calendar.update(data);
        logger.debug(`Update Data => ${JSON.stringify(data)}`);
    },
    /**
     * 커플 캘린더 일정을 삭제합니다.
     * @param calendarId Calendar Id
     */
    deleteCalendar: async (calendarId: number): Promise<void> => {
        const calendar: Calendar | null = await Calendar.findByPk(calendarId);

        if (!calendar) throw new NotFoundError(`Not Found Calendar to Calendar Id ${calendarId}`);

        logger.debug(`Try Delete Data => ${JSON.stringify(calendar)}`);
        await calendar.destroy();
    }
};

export default controller;
