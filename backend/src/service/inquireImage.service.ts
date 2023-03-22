import dayjs from "dayjs";
import { File } from "formidable";
import { Transaction } from "sequelize";

import logger from "../logger/logger";

import { Inquire } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";

import { deleteFolder, uploadFile, uploadFiles } from "../util/firebase";

import { Service } from "./service";

class InquireImageService extends Service {
    private FOLDER_NAME = "users";

    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    select(...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async create(transaction: Transaction | null = null, inquireId: number, userId: number, images: File): Promise<any> {
        const path = `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${images.originalFilename}`;

        await InquireImage.create(
            {
                inquireId: inquireId,
                image: path
            },
            { transaction }
        );

        await uploadFile(path, images.filepath);
        logger.debug(`Create inquire image => ${path}`);
    }

    async createMutiple(transaction: Transaction | null = null, inquireId: number, userId: number, images: File[]) {
        const filePaths: string[] = [];
        const imagePaths: string[] = [];

        images.forEach((image: File) => {
            filePaths.push(image.filepath);
            imagePaths.push(`${this.FOLDER_NAME}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${image.originalFilename}`);
        });

        const [successResults, failedResults]: PromiseSettledResult<any>[][] = await uploadFiles(filePaths, imagePaths);

        failedResults.forEach((failed) => {
            logger.error(`Add inquire image error and ignore => ${JSON.stringify(failed)}`);
        });

        for (const result of successResults) {
            if (result.status === "fulfilled") {
                const path = result.value.metadata.fullPath;

                await InquireImage.create(
                    {
                        inquireId: inquireId,
                        image: path
                    },
                    { transaction }
                );
                logger.debug(`Create Inquire Image => ${path}`);
            }
        }
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async delete(transaction: Transaction | null, imageIds: number[]): Promise<void> {
        await InquireImage.destroy({ where: { imageId: imageIds }, transaction });
    }

    async deleteWitFirebase(transaction: Transaction | null, imageIds: number[], inquire: Inquire): Promise<void> {
        await InquireImage.destroy({ where: { imageId: imageIds }, transaction });

        const path = `${this.FOLDER_NAME}/${inquire.userId}/inquires/${inquire.inquireId}`;
        await deleteFolder(path);
    }
}

export default InquireImageService;
