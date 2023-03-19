import dayjs from "dayjs";
import { File } from "formidable";
import { Transaction } from "sequelize";

import { Couple, IRequestCreate, IUpdateWithService } from "../model/couple.model";
import { User } from "../model/user.model";

import { Service } from "./service";

import logger from "../logger/logger";
import { deleteFile, isDefaultFile, uploadFile } from "../util/firebase";

class CoupleService extends Service {
    private FOLDER_NAME = "couples";

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
        let path = null;
        let isUpload = false;

        try {
            if (file) {
                path = `${this.FOLDER_NAME}/${cupId}/thumbnail/${dayjs().valueOf()}.${file.originalFilename!}`;

                await uploadFile(path, file.filepath);
                isUpload = true;
            }

            const createdCouple = await Couple.create(
                {
                    cupId: cupId,
                    cupDay: data.cupDay,
                    title: data.title,
                    thumbnail: path
                },
                { transaction }
            );

            return createdCouple;
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase thumbnail 삭제
            if (data.thumbnail && isUpload) {
                await deleteFile(path!);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${path}`);
            }

            throw error;
        }
    }

    async update(transaction: Transaction | null = null, couple: Couple, data: IUpdateWithService, thumbnail?: File): Promise<Couple> {
        let isUpload = false;
        const prevThumbnail: string | null = couple.thumbnail;

        try {
            if (thumbnail) {
                const reqFileName = thumbnail.originalFilename!;
                const isDefault = isDefaultFile(reqFileName);

                if (isDefault) data.thumbnail = null;
                else data.thumbnail = `${this.FOLDER_NAME}/${couple.cupId}/thumbnail/${dayjs().valueOf()}.${reqFileName}`;
            }

            await couple.update(data, { transaction });

            // Database Upload 후 File Upload
            if (data.thumbnail && thumbnail) {
                await uploadFile(data.thumbnail, thumbnail.filepath);
                isUpload = true;
            }

            if (prevThumbnail && data.thumbnail) {
                await deleteFile(prevThumbnail);
                logger.debug(`Deleted Previous thumbnail => ${prevThumbnail}`);
            }

            logger.debug(`Update Data => ${JSON.stringify(data)}`);

            return couple;
        } catch (error) {
            // Firebase에는 업로드 되었지만 DB 오류가 발생했다면 Firebase Profile 삭제
            if (data.thumbnail && isUpload) {
                await deleteFile(data.thumbnail);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${data.thumbnail}`);
            }

            throw error;
        }
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
