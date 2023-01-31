import dayjs from "dayjs";

import ForbiddenError from "../error/forbidden";
import NotFoundError from "../error/notFound";

import sequelize from "../model";
import { Couple } from "../model/couple.model";
import { Calendar, ICreate } from "../model/calendar.model";

import logger from "../logger/logger";

const controller = {
    addCalendar: async (data: ICreate): Promise<void> => {
        const couple: Couple | null = await Couple.findByPk(data.cupId);

        if (!couple) throw new NotFoundError(`Not Found Couple ${data.cupId}`);

        await Calendar.create(data);
    }
};

export default controller;
