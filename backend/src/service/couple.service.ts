import dayjs from "dayjs";
import { File } from "formidable";
import { Transaction } from "sequelize";

import { API_ROOT } from "..";

import { Couple, IRequestCreate, IUpdateWithService } from "../model/couple.model";
import { User } from "../model/user.model";

import { Service } from "./service";

import logger from "../logger/logger";
import { deleteFile, isDefaultFile, uploadFile } from "../util/firebase";

class CoupleService extends Service {
    private FOLDER_NAME = "couples";

    getURL(cupId: string): string {
        return `${API_ROOT}/couple/${cupId}`;
    }

    async select(cupId: string, exclude: string[] = []): Promise<Couple | null> {
        const couple: Couple | null = await Couple.findOne({
            where: { cupId: cupId },
            include: {
                model: User,
                as: "users",
                attributes: { exclude }
            }
        });

        return couple;
    }

    async selectByPk(cupId: string): Promise<Couple | null> {
        const couple: Couple | null = await Couple.findByPk(cupId);
        return couple;
    }

    async create(transaction: Transaction | null = null, cupId: string, data: IRequestCreate, file?: File): Promise<Couple> {
        const path: string | null = file ? `${this.FOLDER_NAME}/${cupId}/thumbnail/${dayjs().valueOf()}.${file.originalFilename!}` : null;
        const createdCouple = await Couple.create(
            {
                cupId: cupId,
                cupDay: data.cupDay,
                title: data.title,
                thumbnail: path
            },
            { transaction }
        );

        if (file && path) await uploadFile(path, file.filepath);
        return createdCouple;
    }

    async update(transaction: Transaction | null = null, couple: Couple, data: IUpdateWithService, thumbnail?: File): Promise<Couple> {
        if (thumbnail) {
            const reqFileName = thumbnail.originalFilename!;
            const isDefault = isDefaultFile(reqFileName);

            if (isDefault) data.thumbnail = null;
            else data.thumbnail = `${this.FOLDER_NAME}/${couple.cupId}/thumbnail/${dayjs().valueOf()}.${reqFileName}`;
        }

        await couple.update(data, { transaction });

        // Database Upload 후 File Upload
        if (data.thumbnail && thumbnail) await uploadFile(data.thumbnail, thumbnail.filepath);
        return couple;
    }

    async delete(transaction: Transaction | null = null, couple: Couple): Promise<void> {
        const currentTime = new Date(dayjs().valueOf());

        await couple.update(
            {
                deleted: true,
                deletedTime: currentTime
            },
            { transaction }
        );
    }
}

export default CoupleService;
