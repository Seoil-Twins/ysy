import dayjs from "dayjs";
import { File } from "formidable";
import { Transaction } from "sequelize";

import NotFoundError from "../error/notFound";
import ConflictError from "../error/conflict";

import sequelize from "../model";
import { ICreate, Inquire, IUpdateWithController, IUpdateWithService } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";

import logger from "../logger/logger";
import { deleteFiles, deleteFolder, uploadFile, uploadFiles } from "../util/firebase";

import InquireService from "../service/inquire.service";
import InquireImageService from "../service/inquireImage.service";

class InquireController {
    private FOLDER_NAME = "users";

    private inquireService: InquireService;
    private inquireImageService: InquireImageService;

    constructor(inquireService: InquireService, inquireImageService: InquireImageService) {
        this.inquireService = inquireService;
        this.inquireImageService = inquireImageService;
    }

    /**
     * inquireImage 다중 Image 생성 및 변경을 해주는 함수
     * @param inquireId Inquire Id
     * @param userId User Id (이미지 path 생성할 때 사용)
     * @param images Request로 받은 Image
     * @param transaction transaction
     */
    private async uploads(inquireId: number, userId: number, images: File | File[], transaction: Transaction): Promise<void> {
        try {
            if (images instanceof Array<File>) await this.inquireImageService.createMutiple(transaction, inquireId, userId, images);
            else if (images instanceof File) await this.inquireImageService.create(transaction, inquireId, userId, images);
        } catch (error) {
            logger.error(`Inquire image create error ${JSON.stringify(error)}`);
            throw error;
        }
    }

    async getInquires(userId: number): Promise<Inquire[]> {
        const inquires: Inquire[] = await this.inquireService.selectAll(userId);
        if (inquires.length <= 0) throw new NotFoundError("Not found inquires");

        return inquires;
    }

    async addInquire(data: ICreate, images: File | File[]): Promise<string> {
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            const createdInquire: Inquire = await this.inquireService.create(transaction, data);
            if (images) await this.uploads(createdInquire.inquireId, createdInquire.userId, images, transaction);

            await transaction.commit();
            logger.debug(`Create Inquire => ${JSON.stringify(createdInquire)}`);

            const url: string = this.inquireService.getURL(createdInquire.inquireId);
            return url;
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Inquire create error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async updateInquire(data: IUpdateWithController, images: File | File[]): Promise<Inquire> {
        let transaction: Transaction | undefined = undefined;

        try {
            const inquire: Inquire | null = await this.inquireService.select(data.inquireId);
            if (!inquire) throw new NotFoundError("Not Found inquire");
            else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

            transaction = await sequelize.transaction();

            const imagePaths: string[] = [];
            const imageIds: number[] = [];

            inquire.inquireImages?.forEach((image: InquireImage) => {
                imagePaths.push(image.image);
                imageIds.push(image.imageId);
            });

            await this.inquireImageService.delete(transaction, imageIds);

            const updateData: IUpdateWithService = {
                title: data.title,
                contents: data.contents
            };

            await this.inquireService.update(transaction, inquire, updateData);
            await deleteFiles(imagePaths);
            await this.uploads(inquire.inquireId, inquire.userId, images, transaction);

            await transaction.commit();

            const updatedInquire: Inquire | null = await this.inquireService.select(data.inquireId);
            return updatedInquire!;
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Inquire update error | ${data.inquireId} => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async deleteInquire(inquireId: number): Promise<void> {
        let transaction: Transaction | undefined = undefined;
        const inquire: Inquire | null = await this.inquireService.select(inquireId);
        if (!inquire) throw new NotFoundError("Not Found Inquire");
        else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

        try {
            transaction = await sequelize.transaction();

            const inquireImage: InquireImage[] = await InquireImage.findAll({ where: { inquireId } });

            // inquire Image Table은 delete cascade에 의해 삭제됨.
            await this.inquireService.delete(transaction, inquire);

            if (inquireImage.length > 0) {
                const path = `${this.FOLDER_NAME}/${inquire.userId}/inquires/${inquireId}`;
                await deleteFolder(path);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Inquire delete error => ${JSON.stringify(error)}`);

            throw error;
        }
    }
}

export default InquireController;
