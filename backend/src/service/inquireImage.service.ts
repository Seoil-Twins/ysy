import dayjs from "dayjs";
import { File } from "formidable";
import { Transaction } from "sequelize";
import UploadError from "../error/firebaseUploadError";
import InternalServerError from "../error/internalServer";

import logger from "../logger/logger";

import { InquireImage } from "../model/inquireImage.model";

import { deleteFile, deleteFiles, deleteFolder, uploadFile, uploadFiles } from "../util/firebase";

import { Service } from "./service";

class InquireImageService extends Service {
    private FOLDER_NAME = "users";

    private getFolderPath(userId: number, inquireId: number): string {
        return `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}`;
    }

    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    select(...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async create(transaction: Transaction | null = null, inquireId: number, userId: number, images: File): Promise<InquireImage> {
        if (inquireId) throw new Error("hi");

        const path = `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${images.originalFilename}`;
        const createdInquireImage: InquireImage = await InquireImage.create(
            {
                inquireId: inquireId,
                image: path
            },
            { transaction }
        );

        await uploadFile(path, images.filepath);
        logger.debug(`Create inquire image => ${path}`);

        return createdInquireImage;
    }

    async createMutiple(transaction: Transaction | null = null, inquireId: number, userId: number, images: File[]): Promise<InquireImage[]> {
        const imagePaths: string[] = [];
        const inquireImages: InquireImage[] = [];

        try {
            for (const image of images) {
                const path: string = `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}/${dayjs().valueOf()}.${image.originalFilename}`;

                const createdInquireImage: InquireImage = await InquireImage.create(
                    {
                        inquireId: inquireId,
                        image: path
                    },
                    { transaction }
                );
                await uploadFile(path, image.filepath);

                imagePaths.push(path);
                inquireImages.push(createdInquireImage);
                logger.debug(`created inquire image => ${path}`);
            }
        } catch (error) {
            throw new UploadError(imagePaths, "inquire firebase upload error");
        }

        return inquireImages;
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async delete(transaction: Transaction | null, imageIds: number[]): Promise<void> {
        await InquireImage.destroy({ where: { imageId: imageIds }, transaction });
    }
}

export default InquireImageService;
