import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service";

import { FilterOptions, InquireImage, InquireImageResponseWithCount, PageOptions, SearchOptions } from "../model/inquireImage.model";

import { API_ROOT } from "..";

class InquireImageAdminService extends Service {
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
        let result: WhereOptions<InquireImage> = {};

        if (searchOptions.inquireId) result.inquireId = searchOptions.inquireId;
        if (filterOptions.fromDate && filterOptions.toDate) result.createdTime = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

        return result;
    }

    getURL(): string {
        return `${API_ROOT}/admin/inquire-image?count=10&page=1`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<InquireImageResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions<InquireImage> = this.createWhere(searchOptions, filterOptions);

        const { rows, count }: { rows: InquireImage[]; count: number } = await InquireImage.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort]
        });
        const result: InquireImageResponseWithCount = {
            images: rows,
            count: count
        };

        return result;
    }

    async selectAll(imageIds: number[]): Promise<InquireImage[]> {
        const inquireImages: InquireImage[] = await InquireImage.findAll({
            where: { imageId: imageIds }
        });

        return inquireImages;
    }

    create(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export default InquireImageAdminService;
