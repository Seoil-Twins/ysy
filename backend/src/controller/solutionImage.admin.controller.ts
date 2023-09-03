import { File } from "formidable";
import { Transaction } from "sequelize";

import sequelize from "../model";
import { Inquire } from "../model/inquire.model";
import { Solution } from "../model/solution.model";
import { FilterOptions, PageOptions, SearchOptions, SolutionImage, SolutionImageResponseWithCount } from "../model/solutionImage.model";

import SolutionAdminService from "../service/solution.admin.service";
import SolutionImageAdminService from "../service/solutionImage.admin.service";
import InquireAdminService from "../service/inquire.admin.service";

import logger from "../logger/logger";
import { deleteFile, deleteFiles } from "../util/firebase.util";

import UploadError from "../error/upload.error";
import BadRequestError from "../error/badRequest.error";
import NotFoundError from "../error/notFound.error";

class SolutionImageAdminController {
    private solutionAdminService: SolutionAdminService;
    private solutionImageAdminService: SolutionImageAdminService;
    private inquireAdminService: InquireAdminService;

    constructor(solutionAdminService: SolutionAdminService, solutionImageAdminService: SolutionImageAdminService, inquireAdminService: InquireAdminService) {
        this.solutionAdminService = solutionAdminService;
        this.solutionImageAdminService = solutionImageAdminService;
        this.inquireAdminService = inquireAdminService;
    }

    async getSolutionImages(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<SolutionImageResponseWithCount> {
        const result: SolutionImageResponseWithCount = await this.solutionImageAdminService.select(pageOptions, searchOptions, filterOptions);
        if (result.count <= 0) throw new NotFoundError("Not found solution images");

        return result;
    }

    async addSolutionImages(solutionId: number, images: File | File[]): Promise<string> {
        let createdImages: SolutionImage | SolutionImage[] | undefined = undefined;
        const solution: Solution | null = await this.solutionAdminService.select(solutionId);
        if (!solution) throw new NotFoundError(`Not found solution with using inquireId => ${solution}`);

        const solutionImageCount: number = solution.solutionImages ? solution.solutionImages.length : 0;
        const imagesCount: number = images instanceof Array<File> ? images.length : 1;
        if (solutionImageCount + imagesCount > 5) throw new BadRequestError("There are a maximum of 5 solutionImages images");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();
            const inquires: Inquire[] = await this.inquireAdminService.selectByPk([solution.inquireId]);
            if (inquires.length <= 0) throw new NotFoundError(`Not found inquire with using ${solution.inquireId}`);

            if (images instanceof Array<File>) {
                createdImages = await this.solutionImageAdminService.createMutiple(transaction, solutionId, inquires[0].inquireId, inquires[0].userId, images);
            } else {
                createdImages = await this.solutionImageAdminService.create(transaction, solutionId, inquires[0].inquireId, inquires[0].userId, images);
            }

            await transaction.commit();

            const url: string = this.solutionImageAdminService.getURL();
            return url;
        } catch (error) {
            logger.error(`Add inquire images error => ${JSON.stringify(error)}`);

            if (error instanceof UploadError) {
                const paths: string[] = error.paths;
                for (const path of paths) await deleteFile(path);

                logger.error(`After updating the firebase, a db error occurred and the firebase thumbnail is deleted => ${JSON.stringify(paths)}`);
            } else if (createdImages instanceof Array<File>) {
                const paths: string[] = [];
                createdImages.forEach((image: SolutionImage) => {
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

    async deleteSolutionImages(imageIds: number[]): Promise<void> {
        const solutionImages: SolutionImage[] = await this.solutionImageAdminService.selectAll(imageIds);
        if (solutionImages.length <= 0) throw new BadRequestError(`Not found solution images with using ${imageIds}`);

        await this.solutionImageAdminService.delete(null, imageIds);

        const imagePaths: string[] = solutionImages.map((solution: SolutionImage) => solution.image);
        await deleteFiles(imagePaths);
    }
}

export default SolutionImageAdminController;