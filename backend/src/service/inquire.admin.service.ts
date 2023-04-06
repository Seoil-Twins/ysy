import { Op, OrderItem, Sequelize, Transaction, WhereOptions } from "sequelize";
import { Service } from "./service";
import { FilterOptions, IInquireResponseWithCount, Inquire, PageOptions, SearchOptions } from "../model/inquire.model";
import { Solution } from "../model/solution.model";
import { InquireImage } from "../model/inquireImage.model";
import { SolutionImage } from "../model/solutionImage.model";
import sequelize from "../model";
import { API_ROOT } from "..";

class InquireAdminService extends Service {
    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["createdTime", "DESC"];

        switch (sort) {
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            case "sr":
                result = [sequelize.literal("`solution.createdTime`"), "DESC"];
                break;
            case "so":
                result = [sequelize.literal("`solution.createdTime`"), "ASC"];
                break;
            default:
                result = ["createdTime", "DESC"];
                break;
        }

        return result;
    }

    private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
        let result: WhereOptions<Inquire> = {};

        if (searchOptions.userId) result.userId = searchOptions.userId;
        if (filterOptions.fromDate && filterOptions.toDate) result.createdTime = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

        return result;
    }

    getURL(): string {
        return `${API_ROOT}/admin/inquire?page=1&count=10&sort=r`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<IInquireResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions = this.createWhere(searchOptions, filterOptions);

        let isSolution: boolean | undefined = undefined;
        if (pageOptions.sort === "sr" || pageOptions.sort === "so") isSolution = true;
        else isSolution = filterOptions.isSolution;

        const hasImage: boolean | undefined = filterOptions.hasImage ? filterOptions.hasImage : undefined;

        const { rows, count }: { rows: Inquire[]; count: number } = await Inquire.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort],
            include: [
                {
                    model: InquireImage,
                    as: "inquireImages",
                    attributes: { exclude: ["inquireId"] },
                    required: hasImage
                },
                {
                    model: Solution,
                    as: "solution",
                    attributes: { exclude: ["inquireId"] },
                    required: isSolution,
                    include: [
                        {
                            model: SolutionImage,
                            as: "solutionImages",
                            attributes: { exclude: ["solutionId"] }
                        }
                    ]
                }
            ],
            distinct: true
        });

        const result: IInquireResponseWithCount = {
            inquires: rows,
            count: count
        };

        return result;
    }

    async selectByPk(inquireIds: number[]): Promise<Inquire[]> {
        const inquires: Inquire[] = await Inquire.findAll({
            where: { inquireId: inquireIds },
            include: [
                {
                    model: InquireImage,
                    as: "inquireImages"
                },
                {
                    model: Solution,
                    as: "solution",
                    include: [
                        {
                            model: SolutionImage,
                            as: "solutionImages"
                        }
                    ]
                }
            ]
        });

        return inquires;
    }

    create(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async delete(transaction: Transaction | null, inquireIds: number[]): Promise<void> {
        await Inquire.destroy({ where: { inquireId: inquireIds }, transaction });
    }
}

export default InquireAdminService;
