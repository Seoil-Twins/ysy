import dayjs from "dayjs";
import { File } from "formidable";

import { Transaction } from "sequelize";
import logger from "../logger/logger";
import { AlbumImage } from "../model/albnmImage.model";
import { deleteFile, deleteFiles, uploadFile, uploadFiles } from "../util/firebase.util";

import { Service } from "./service";

class AlbumImageService extends Service {
    private FOLDER_NAME = "couples";

    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    async select(imageIds: number[]): Promise<AlbumImage[]> {
        const images: AlbumImage[] = await AlbumImage.findAll({ where: { imageId: imageIds } });
        return images;
    }

    async selectWithTotal(albumId: number, page: number, limit: number): Promise<{ rows: AlbumImage[]; count: number }> {
        const offset: number = (page - 1) * limit;
        const { rows, count }: { rows: AlbumImage[]; count: number } = await AlbumImage.findAndCountAll({
            where: { albumId },
            attributes: { exclude: ["albumId"] },
            offset,
            limit
        });

        return { rows, count };
    }

    async create(transaction: Transaction | null = null, cupId: string, albumId: number, image: File): Promise<AlbumImage> {
        const path = `${this.FOLDER_NAME}//${cupId}/${albumId}/${dayjs().valueOf()}.${image.originalFilename}`;

        const createdImage: AlbumImage = await AlbumImage.create(
            {
                albumId: albumId,
                image: path
            },
            { transaction }
        );

        await uploadFile(path, image.filepath);
        logger.debug(`Create album image => ${path}`);

        return createdImage;
    }

    async createMutiple(transaction: Transaction | null = null, cupId: string, albumId: number, images: File[]): Promise<AlbumImage[]> {
        const filePaths: string[] = [];
        const imagePaths: string[] = [];
        const createdImages: AlbumImage[] = [];

        images.forEach((image: File) => {
            filePaths.push(image.filepath);
            imagePaths.push(`${this.FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}.${image.originalFilename}`);
        });

        const [successResults, failedResults]: PromiseSettledResult<any>[][] = await uploadFiles(filePaths, imagePaths);

        failedResults.forEach((failed) => {
            logger.error(`Add album error and ignore => ${JSON.stringify(failed)}`);
        });

        for (const result of successResults) {
            if (result.status === "fulfilled") {
                let createdImage: AlbumImage;
                const path: string = result.value.metadata.fullPath;

                try {
                    createdImage = await AlbumImage.create(
                        {
                            albumId: albumId,
                            image: path
                        },
                        { transaction }
                    );

                    createdImages.push(createdImage);
                    logger.debug(`Create album image => ${path}`);
                } catch (error) {
                    logger.error(`Create album image error and ignore image => ${JSON.stringify(error)} | ${path}`);
                    await deleteFile(path);
                }
            }
        }

        return createdImages;
    }

    update(_transaction: Transaction | null = null): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async delete(transaction: Transaction | null = null, imageIds: number[]): Promise<any> {
        await AlbumImage.destroy({ where: { imageId: imageIds }, transaction });
    }
}

export default AlbumImageService;
