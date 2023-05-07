import dayjs from "dayjs";
import { File } from "formidable";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service";

import { FilterOptions, PageOptions, SearchOptions, SolutionImage, SolutionImageResponseWithCount } from "../model/solutionImage.model";

import { API_ROOT } from "..";
import logger from "../logger/logger";
import { uploadFile } from "../util/firebase.util";

import UploadError from "../error/upload.error";

class SolutionImageAdminService extends Service {
    private FOLDER_NAME = "users";

    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["createdTime", "DESC"];

        switch (sort) {
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            default:
                result = ["createdTime", "DESC"];
                break;
        }

        return result;
    }

    private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
        let result: WhereOptions<SolutionImage> = {};

        if (searchOptions.solutionId) result.solutionId = searchOptions.solutionId;
        if (filterOptions.fromDate && filterOptions.toDate) result.createdTime = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

        return result;
    }

    getFolderPath(userId: number, inquireId: number): string {
        return `${this.FOLDER_NAME}/${userId}/inquires/${inquireId}/solution`;
    }

    getURL(): string {
        return `${API_ROOT}/admin/solution-image?count=10&page=1`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<SolutionImageResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions<SolutionImage> = this.createWhere(searchOptions, filterOptions);

        const { rows, count }: { rows: SolutionImage[]; count: number } = await SolutionImage.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort]
        });
        const result: SolutionImageResponseWithCount = {
            images: rows,
            count: count
        };

        return result;
    }

    async selectAll(imageIds: number[]): Promise<SolutionImage[]> {
        const solutionImages: SolutionImage[] = await SolutionImage.findAll({
            where: { imageId: imageIds }
        });

        return solutionImages;
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
        logger.debug(`Create solution image => ${path}`);

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

    async delete(transaction: Transaction | null, imageIds: number[]): Promise<void> {
        await SolutionImage.destroy({ where: { imageId: imageIds }, transaction });
    }
}

export default SolutionImageAdminService;
