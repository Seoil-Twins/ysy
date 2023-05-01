import { Transaction } from "sequelize";
import { Service } from "./service";
import { SolutionImage } from "../model/solutionImage.model";
import { uploadFile } from "../util/firebase.util";
import { File } from "formidable";
import dayjs from "dayjs";
import logger from "../logger/logger";
import UploadError from "../error/upload.error";

class SolutionImageAdminService extends Service {
    private FOLDER_NAME = "users";

    getFolderPath(userId: number, inquireId: number): string {
        return `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}/solution`;
    }

    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    select(...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async create(transaction: Transaction | null = null, solutionId: number, inquireId: number, userId: number, images: File): Promise<SolutionImage> {
        const path = `${this.getFolderPath(userId, inquireId)}/${dayjs().valueOf()}.${images.originalFilename}`;
        const createdSolutionImage: SolutionImage = await SolutionImage.create(
            {
                solutionId: solutionId,
                image: path
            },
            { transaction }
        );

        await uploadFile(path, images.filepath);
        logger.debug(`Create inquire image => ${path}`);

        return createdSolutionImage;
    }

    async createMutiple(
        transaction: Transaction | null = null,
        solutionId: number,
        inquireId: number,
        userId: number,
        images: File[]
    ): Promise<SolutionImage[]> {
        const imagePaths: string[] = [];
        const solutionImages: SolutionImage[] = [];

        try {
            for (const image of images) {
                const path: string = `${this.getFolderPath(userId, inquireId)}/${dayjs().valueOf()}.${image.originalFilename}`;

                const createdSolutionImage: SolutionImage = await SolutionImage.create(
                    {
                        solutionId: solutionId,
                        image: path
                    },
                    { transaction }
                );
                await uploadFile(path, image.filepath);

                imagePaths.push(path);
                solutionImages.push(createdSolutionImage);
                logger.debug(`created solution image => ${path}`);
            }
        } catch (error) {
            throw new UploadError(imagePaths, "solution firebase upload error");
        }

        return solutionImages;
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default SolutionImageAdminService;
