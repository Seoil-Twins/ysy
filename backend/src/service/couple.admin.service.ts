import { boolean } from "boolean";
import { GroupedCountResultItem, Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service";

import { Couple, FilterOptions, ICoupleResponseWithCount, PageOptions, SearchOptions } from "../model/couple.model";

import { deleteFile } from "../util/firebase.util";
import { User } from "../model/user.model";

class CoupleAdminService extends Service {
    private FOLDER_NAME = "couples";

    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["createdTime", "DESC"];

        switch (sort) {
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            case "dr":
                result = ["deletedTime", "DESC"];
                break;
            case "do":
                result = ["deletedTime", "ASC"];
                break;
            default:
                result = ["createdTime", "DESC"];
                break;
        }

        return result;
    }

    private createWhere = (filterOptions: FilterOptions, cupId?: string): WhereOptions => {
        let result: WhereOptions = {};

        if (cupId) result["cupId"] = cupId;
        if (boolean(filterOptions.isDeleted)) result["deleted"] = true;
        else if (!boolean(filterOptions.isDeleted)) result["deleted"] = false;
        if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

        return result;
    };

    getURL(...args: any[]): string {
        throw new Error("Method not implemented.");
    }

    async select(pageOptions: PageOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> {
        const offset = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where = this.createWhere(filterOptions);
        const reuslt: ICoupleResponseWithCount = {
            couples: [],
            count: 0
        };

        const { rows, count }: { rows: Couple[]; count: number } = await Couple.findAndCountAll({
            offset,
            limit: pageOptions.count,
            order: [sort],
            where,
            include: {
                model: User,
                as: "users"
            },
            distinct: true // Include로 인해 잘못 counting 되는 현상을 막아줌
        });

        reuslt.count = count;
        reuslt.couples = rows;

        return reuslt;
    }

    async selectWithName(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> {
        const offset = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = this.createSort(pageOptions.sort);
        const where = this.createWhere(filterOptions);
        const result: ICoupleResponseWithCount = {
            couples: [],
            count: 0
        };
        const { rows, count }: { rows: Couple[]; count: GroupedCountResultItem[] } = await Couple.findAndCountAll({
            offset,
            limit: pageOptions.count,
            order: [sort],
            include: {
                model: User,
                as: "users",
                attributes: [],
                where: {
                    name: { [Op.like]: `%${searchOptions.name}%` },
                    cupId: { [Op.not]: null }
                },
                duplicating: false
            },
            where: where,
            group: "Couple.cup_id"
        });

        let couples: any = [];

        for (const row of rows) {
            const users: User[] = await row.getUsers({});

            couples.push({
                ...row.dataValues,
                users: users
            });
        }

        result.couples = couples;
        count.forEach((countObj: GroupedCountResultItem) => {
            result.count += countObj.count;
        });

        return result;
    }

    create(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    update(transaction: Transaction | null, ...args: any[]): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async delete(transaction: Transaction | null, couple: Couple): Promise<any> {
        await couple.destroy({ transaction });
    }
}

export default CoupleAdminService;
