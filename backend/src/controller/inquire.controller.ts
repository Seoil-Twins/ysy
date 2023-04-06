import { File } from "formidable";
import { Transaction } from "sequelize";

import NotFoundError from "../error/notFound.error";
import ConflictError from "../error/conflict.error";

import sequelize from "../model";
import { ICreate, Inquire, IUpdateWithController, IUpdateWithService } from "../model/inquire.model";
import { InquireImage } from "../model/inquireImage.model";

import logger from "../logger/logger";
import { deleteFile, deleteFiles, deleteFolder } from "../util/firebase.util";

import InquireService from "../service/inquire.service";
import InquireImageService from "../service/inquireImage.service";
import UploadError from "../error/upload.error";

class InquireController {
    private inquireService: InquireService;
    private inquireImageService: InquireImageService;

    constructor(inquireService: InquireService, inquireImageService: InquireImageService) {
        this.inquireService = inquireService;
        this.inquireImageService = inquireImageService;
    }

    async getInquires(userId: number): Promise<Inquire[]> {
        const inquires: Inquire[] = await this.inquireService.selectAll(userId);
        if (inquires.length <= 0) throw new NotFoundError("Not found inquires");

        return inquires;
    }

    async addInquire(data: ICreate, images?: File | File[]): Promise<string> {
        let createdInquire: Inquire | null = null;
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            createdInquire = await this.inquireService.create(transaction, data);

            if (images instanceof Array<File>)
                await this.inquireImageService.createMutiple(transaction, createdInquire.inquireId, createdInquire.userId, images);
            else if (images instanceof File) await this.inquireImageService.create(transaction, createdInquire.inquireId, createdInquire.userId, images);

            await transaction.commit();
            logger.debug(`Create Inquire => ${JSON.stringify(createdInquire)}`);

            const url: string = this.inquireService.getURL(createdInquire.inquireId);
            return url;
        } catch (error) {
            if (createdInquire) await deleteFolder(this.inquireService.getFolderPath(createdInquire.userId, createdInquire.inquireId));
            if (transaction) await transaction.rollback();
            logger.error(`Inquire create error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async updateInquire(data: IUpdateWithController, images?: File | File[]): Promise<Inquire> {
        let updatedInquireImages: InquireImage | InquireImage[] | null = null;
        let transaction: Transaction | undefined = undefined;
        const imagePaths: string[] = [];
        const imageIds: number[] = [];

        try {
            const inquire: Inquire | null = await this.inquireService.select(data.inquireId);
            if (!inquire) throw new NotFoundError("Not Found inquire");
            else if (inquire.solution) throw new ConflictError("This inquiry has already been answered");

            transaction = await sequelize.transaction();

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

            if (images instanceof Array<File>)
                updatedInquireImages = await this.inquireImageService.createMutiple(transaction, inquire.inquireId, inquire.userId, images);
            else if (images instanceof File)
                updatedInquireImages = await this.inquireImageService.create(transaction, inquire.inquireId, inquire.userId, images);

            await transaction.commit();
            await deleteFiles(imagePaths);

            const result: Inquire | null = await this.inquireService.select(data.inquireId);
            return result!;
        } catch (error) {
            // createMultiple에서 N개는 성공하고 하나라도 실패한다면 모든 걸 없애줘야하기 때문에 error 객체에 따로 path 정보를 가지고 있음
            if (error instanceof UploadError) {
                const paths: string[] = error.paths;
                for (const path of paths) await deleteFile(path);

                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(paths)}`);
            } else if (updatedInquireImages instanceof InquireImage) {
                // create or createMultiple은 성공했지만 commit에서 터진다면
                await deleteFile(updatedInquireImages.image);
                logger.error(
                    `After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(updatedInquireImages)}`
                );
            } else if (updatedInquireImages instanceof Array<InquireImage>) {
                // create or createMultiple은 성공했지만 commit에서 터진다면
                const paths: string[] = [];
                updatedInquireImages.forEach((image: InquireImage) => {
                    paths.push(image.image);
                });

                await deleteFiles(paths);
                logger.error(
                    `After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(updatedInquireImages)}`
                );
            }

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

            // inquire Image Table은 delete cascade에 의해 삭제됨.
            await this.inquireService.delete(transaction, inquire);
            await transaction.commit();

            await deleteFolder(this.inquireService.getFolderPath(inquire.userId, inquire.inquireId));
        } catch (error) {
            if (transaction) await transaction.rollback();
            logger.error(`Inquire delete error => ${JSON.stringify(error)}`);

            throw error;
        }
    }
}

export default InquireController;
