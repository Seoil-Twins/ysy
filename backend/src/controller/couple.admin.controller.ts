import { Op } from "sequelize";
import { boolean } from "boolean";

import logger from "../logger/logger";
import { deleteFile } from "../util/firebase.util";

import albumController from "./album.controller";

import sequelize from "../model";
import { User } from "../model/user.model";
import { Couple, FilterOptions, ICoupleResponseWithCount, PageOptions, SearchOptions } from "../model/couple.model";
import { OrderItem, WhereOptions } from "sequelize/types/model";
import { Album } from "../model/album.model";
import { ErrorImage } from "../model/errorImage.model";
import NotFoundError from "../error/notFound.error";

const FOLDER_NAME = "couples";

const createSort = (sort: string): OrderItem => {
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
};

const createWhere = (filterOptions: FilterOptions, cupId?: string): WhereOptions => {
    let result: WhereOptions = {};

    if (cupId) result["cupId"] = cupId;
    if (boolean(filterOptions.isDeleted)) result["deleted"] = true;
    if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

    return result;
};

const controller = {
    /**
     * Admin API 전용이며 Pagination, Sort, Search 등을 사용하여 검색할 수 있습니다.
     *
     * ```typescript
     * const pageOptions: PageOptions = {
     *      count: 10,
     *      page: 1,
     *      sort: "r"
     * };
     * const searchOptions: SearchOptions = { name: "용" };
     * const filterOptions: FilterOptions = {
     *      fromDate: "2022-02-25",
     *      toDate: "2022-02-27",
     *      isDeleted: false            // Get only deleted couple.
     * };
     *
     * const result: ICoupleResponseWithCount = await coupleController.getCouplesWithAdmin(pageOptions, searchOptions, filterOptions);
     * ```
     * @param pageOptions {@link PageOptions}
     * @param searchOptions {@link SearchOptions}
     * @param filterOptions {@link FilterOptions}
     * @returns A {@link ICoupleResponseWithCount}
     */
    getCouples: async (pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> => {
        const offset = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = createSort(pageOptions.sort);
        const reuslt: ICoupleResponseWithCount = {
            couples: [],
            count: 0
        };

        if (searchOptions.name && searchOptions.name !== "undefined") {
            let { rows, count }: { rows: User[]; count: number } = await User.findAndCountAll({
                offset,
                limit: pageOptions.count,
                order: [sort],
                where: {
                    name: { [Op.like]: `%${searchOptions.name}%` },
                    cupId: { [Op.not]: null }
                }
            });

            if (rows.length > 0) {
                rows = rows.filter((user: User, idx: number, self: User[]) => idx === self.findIndex((t) => t.cupId === user.cupId));

                for (let i = 0; i < rows.length; i++) {
                    const where = createWhere(filterOptions, rows[i].cupId!);
                    const couple: Couple | null = await Couple.findOne({
                        where,
                        include: {
                            model: User,
                            as: "users"
                        }
                    });

                    reuslt.couples.push(couple!);
                }

                reuslt.count = count - (count - rows.length);
            }
        } else {
            const where = createWhere(filterOptions);

            let { rows, count }: { rows: Couple[]; count: number } = await Couple.findAndCountAll({
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
        }

        return reuslt;
    },
    deleteCouples: async (coupleIds: string[]): Promise<void> => {
        const couples = await Couple.findAll({
            where: { cupId: coupleIds },
            include: [
                {
                    model: Album,
                    as: "albums"
                },
                {
                    model: User,
                    as: "users"
                }
            ]
        });

        couples.forEach(async (couple: Couple) => {
            const transaction = await sequelize.transaction();

            try {
                if (couple.thumbnail) await deleteFile(couple.thumbnail!);

                if (couple.albums) {
                    const albums: Album[] = await couple.albums!;

                    albums.forEach(async (album: Album) => {
                        try {
                            // await albumController.deleteAlbum(couple.cupId, album.albumId);
                        } catch (error) {
                            if (error instanceof NotFoundError) return;
                        }
                    });
                }

                couple.users!.forEach(async (user: User) => {
                    await user.update({ cupId: null }, { transaction });
                });

                await couple.destroy({ transaction });

                transaction.commit();
            } catch (error) {
                transaction.rollback();
            }
        });
    }
};

export default controller;
