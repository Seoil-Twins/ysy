import { GroupedCountResultItem, Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service";

import { API_ROOT } from "..";

import sequelize from "../model";
import { User } from "../model/user.model";
import { Inquire } from "../model/inquire.model";
import { SolutionImage } from "../model/solutionImage.model";
import { FilterOptions, ICreate, ISolutionResponseWithCount, IUpdate, PageOptions, SearchOptions, Solution } from "../model/solution.model";

class SolutionAdminService extends Service {
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
        let result: WhereOptions<Solution> = {};

        if (searchOptions.title) result.title = { [Op.like]: `%${searchOptions.title}%` };
        if (filterOptions.fromDate && filterOptions.toDate) result.createdTime = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

        return result;
    }

    getURL(): string {
        return `${API_ROOT}/admin/inquire?page=1&count=10&sort=sr`;
    }

    async select(solutionId: number): Promise<Solution | null> {
        const solution: Solution | null = await Solution.findOne({
            where: { solutionId },
            include: {
                model: SolutionImage,
                as: "solutionImages"
            }
        });

        return solution;
    }

    async selectByInId(inquireId: number): Promise<Solution | null> {
        const solution: Solution | null = await Solution.findOne({
            where: { inquireId }
        });

        return solution;
    }

    async selectAll(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ISolutionResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions = this.createWhere(searchOptions, filterOptions);
        const hasImage: boolean | undefined = filterOptions.hasImage ? filterOptions.hasImage : undefined;

        const { rows, count }: { rows: Solution[]; count: number } = await Solution.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort],
            include: {
                model: SolutionImage,
                as: "solutionImages",
                attributes: { exclude: ["solutionId"] },
                required: hasImage
            },
            distinct: true
        });

        const result: ISolutionResponseWithCount = {
            solutions: rows,
            count
        };

        return result;
    }

    async selectAllWithUserId(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ISolutionResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions = this.createWhere(searchOptions, filterOptions);
        const hasImage: boolean | undefined = filterOptions.hasImage ? filterOptions.hasImage : undefined;
        const userId: number | undefined = searchOptions.userId;
        const result: ISolutionResponseWithCount = {
            solutions: [],
            count: 0
        };

        const { rows, count }: { rows: Solution[]; count: GroupedCountResultItem[] } = await Solution.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort],
            include: [
                {
                    model: Inquire,
                    as: "inquire",
                    attributes: [],
                    on: {
                        "$inquire.inquire_id$": sequelize.col("Solution.inquire_id")
                    },
                    where: {
                        userId: userId
                    }
                },
                {
                    model: SolutionImage,
                    as: "solutionImages",
                    attributes: { exclude: ["solutionId"] },
                    required: hasImage
                }
            ],
            group: "Solution.solution_id",
            distinct: true
        });

        result.solutions = rows;
        count.forEach((countObj: GroupedCountResultItem) => {
            result.count += countObj.count;
        });

        return result;
    }

    async selectAllWithUserName(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ISolutionResponseWithCount> {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where: WhereOptions = this.createWhere(searchOptions, filterOptions);
        const hasImage: boolean | undefined = filterOptions.hasImage ? filterOptions.hasImage : undefined;
        const userName: string | undefined = searchOptions.username;
        const result: ISolutionResponseWithCount = {
            solutions: [],
            count: 0
        };

        /**
         * required 안 해주면 left outer join이기 때문에 (left = solution table)
         * 해당 inquire이 없어도 solution를 가져옴.
         * required 해주면 inner join
         * solution Image를 join 하게 되면 inquire가 내부 조인이 되기 때문에 외부에서 inquire를 사용할 수가 없어짐
         * 그래서 따로 mixin을 사용하여 구하도록 함.
         */
        const { rows, count }: { rows: Solution[]; count: GroupedCountResultItem[] } = await Solution.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort],
            include: [
                {
                    model: Inquire,
                    as: "inquire",
                    attributes: [],
                    required: true,
                    on: {
                        "$inquire.inquire_id$": sequelize.col("Solution.inquire_id")
                    },
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: [],
                            required: true,
                            where: {
                                name: { [Op.like]: `%${userName}%` }
                            }
                        }
                    ]
                }
            ],
            group: "Solution.solution_id",
            distinct: true
        });

        const hasImages: any[] = [];

        // 해당 솔루션 이미지 가져오기
        for (const solution of rows) {
            const solutionImages: SolutionImage[] = await solution.getSolutionImages();

            if (filterOptions.hasImage && solutionImages.length <= 0) {
                result.count -= 1;
                continue;
            }

            hasImages.push({
                ...solution.dataValues,
                solutionImages: solutionImages
            });
        }

        result.solutions = hasImages;
        count.forEach((countObj: GroupedCountResultItem) => {
            result.count += countObj.count;
        });

        return result;
    }

    async selectAllWithSolutionId(solutionIds: number[]): Promise<Solution[]> {
        const solutions: Solution[] = await Solution.findAll({
            where: { solutionId: solutionIds }
        });

        return solutions;
    }

    async create(transaction: Transaction | null, inquireId: number, data: ICreate): Promise<Solution> {
        const createdSolution: Solution = await Solution.create(
            {
                inquireId,
                ...data
            },
            { transaction }
        );

        return createdSolution;
    }

    async update(transaction: Transaction | null, solution: Solution, data: IUpdate): Promise<Solution> {
        const updatedSolution = await solution.update(data, { transaction });
        return updatedSolution;
    }

    delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async deletes(transaction: Transaction | null, solutionIds: number[]): Promise<any> {
        await Solution.destroy({
            where: { solutionId: solutionIds }
        });
    }
}

export default SolutionAdminService;
