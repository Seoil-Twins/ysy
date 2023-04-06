import { File } from "formidable";
import { Transaction } from "sequelize";

import InquireAdminService from "../service/inquire.admin.service";
import InquireService from "../service/inquire.service";
import InquireImageService from "../service/inquireImage.service";

import sequelize from "../model";
import { InquireImage } from "../model/inquireImage.model";
import { FilterOptions, ICreate, IInquireResponseWithCount, Inquire, PageOptions, SearchOptions } from "../model/inquire.model";

import logger from "../logger/logger";
import { deleteFiles, deleteFolder } from "../util/firebase.util";

import NotFoundError from "../error/notFound.error";
import BadRequestError from "../error/badRequest.error";

class InquireAdminController {
    private inquireService: InquireService;
    private inquireAdminService: InquireAdminService;
    private inquireImageService: InquireImageService;

    constructor(inquireService: InquireService, inquireAdminService: InquireAdminService, inquireImageService: InquireImageService) {
        this.inquireService = inquireService;
        this.inquireAdminService = inquireAdminService;
        this.inquireImageService = inquireImageService;
    }

    async getInquires(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<IInquireResponseWithCount> {
        const result: IInquireResponseWithCount = await this.inquireAdminService.select(pageOptions, searchOptions, filterOptions);
        if (result.count <= 0) throw new BadRequestError("Not found inquires");

        return result;
    }

    async addInquire(data: ICreate, images?: File | File[]): Promise<string> {
        let createdInquire: Inquire | null = null;
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            createdInquire = await this.inquireService.create(transaction, data);

            if (images instanceof Array<File>) {
                await this.inquireImageService.createMutiple(transaction, createdInquire.inquireId, createdInquire.userId, images);
            } else if (images instanceof File) {
                await this.inquireImageService.create(transaction, createdInquire.inquireId, createdInquire.userId, images);
            }

            await transaction.commit();
            logger.debug(`Create Inquire => ${JSON.stringify(createdInquire)}`);

            const url: string = this.inquireAdminService.getURL();
            return url;
        } catch (error) {
            if (createdInquire) await deleteFolder(this.inquireService.getFolderPath(createdInquire.userId, createdInquire.inquireId));
            if (transaction) await transaction.rollback();
            logger.error(`Inquire create error => ${JSON.stringify(error)}`);

            throw error;
        }
    }

    async deleteInquires(inquireIds: number[]): Promise<void> {
        const allDeleteFiles: string[] = [];
        const inquires: Inquire[] = await this.inquireAdminService.selectByPk(inquireIds);
        if (inquires.length <= 0) throw new NotFoundError(`Not found inquire using query parameter inquireIds => ${inquireIds}`);

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const inquire of inquires) {
                const inquireImages: InquireImage[] = await this.inquireImageService.select(inquire.inquireId);

                inquireImages.forEach((inquire: InquireImage) => {
                    allDeleteFiles.push(inquire.image);
                });

                await this.inquireService.delete(transaction, inquire);

                // soluton image 삭제
                // if (inquire.solution) await solutionController.deleteSolution(inquire.solution.solutionId);
            }

            await transaction.commit();

            if (allDeleteFiles.length > 0) deleteFiles(allDeleteFiles);
        } catch (error) {
            logger.error(`Inquire delete error => ${JSON.stringify(error)}`);

            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

export default InquireAdminController;