import { File } from "formidable";
import { Transaction } from "sequelize";

import sequelize from "../model";
import { Inquire } from "../model/inquire.model";
import { FilterOptions, InquireImage, InquireImageResponseWithCount, PageOptions, SearchOptions } from "../model/inquireImage.model";

import InquireService from "../service/inquire.service";
import InquireImageAdminService from "../service/inquireImage.admin.service";
import InquireImageService from "../service/inquireImage.service";

import UploadError from "../error/upload.error";
import BadRequestError from "../error/badRequest.error";
import NotFoundError from "../error/notFound.error";

import logger from "../logger/logger";
import { deleteFile, deleteFiles } from "../util/firebase.util";

class InquireImageAdminController {
    private inquireService: InquireService;
    private inquireImageService: InquireImageService;
    private inquireImageAdminService: InquireImageAdminService;

    constructor(inquireService: InquireService, inquireImageService: InquireImageService, inquireImageAdminService: InquireImageAdminService) {
        this.inquireService = inquireService;
        this.inquireImageService = inquireImageService;
        this.inquireImageAdminService = inquireImageAdminService;
    }

    async getInquireImages(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<InquireImageResponseWithCount> {
        const result: InquireImageResponseWithCount = await this.inquireImageAdminService.select(pageOptions, searchOptions, filterOptions);
        if (result.count <= 0) throw new NotFoundError("Not found inquire images");

        return result;
    }

    async addInquireImages(inquireId: number, images: File | File[]): Promise<string> {
        let createdImages: InquireImage | InquireImage[] | undefined = undefined;
        const inquire: Inquire | null = await this.inquireService.select(inquireId);
        if (!inquire) throw new NotFoundError(`Not found inquire with using inquireId => ${inquireId}`);

        const inquireImageCount: number = inquire.inquireImages ? inquire.inquireImages.length : 0;
        const imagesCount: number = images instanceof Array<File> ? images.length : 1;
        if (inquireImageCount + imagesCount > 5) throw new BadRequestError("There are a maximum of 5 inquire images");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            if (images instanceof Array<File>) {
                createdImages = await this.inquireImageService.createMutiple(transaction, inquireId, inquire.userId, images);
            } else {
                createdImages = await this.inquireImageService.create(transaction, inquireId, inquire.userId, images);
            }

            await transaction.commit();

            const url: string = this.inquireImageAdminService.getURL();
            return url;
        } catch (error) {
            logger.error(`Add inquire images error => ${JSON.stringify(error)}`);

            if (error instanceof UploadError) {
                const paths: string[] = error.paths;
                for (const path of paths) await deleteFile(path);

                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(paths)}`);
            } else if (createdImages instanceof Array<File>) {
                const paths: string[] = [];
                createdImages.forEach((image: InquireImage) => {
                    paths.push(image.image);
                });

                await deleteFiles(paths);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(createdImages)}`);
            } else if (createdImages) {
                await deleteFile(createdImages.image);
                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(createdImages)}`);
            }

            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

export default InquireImageAdminController;
