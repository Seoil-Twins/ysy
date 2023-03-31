import { Op } from "sequelize";
import { boolean } from "boolean";

import logger from "../logger/logger";
import { deleteFile } from "../util/firebase.util";

import CoupleAdminService from "../service/couple.admin.service";

import sequelize from "../model";
import { User } from "../model/user.model";
import { Couple, FilterOptions, ICoupleResponseWithCount, PageOptions, SearchOptions } from "../model/couple.model";
import { FindAndCountOptions, OrderItem, WhereOptions } from "sequelize/types/model";
import { Album } from "../model/album.model";
import { ErrorImage } from "../model/errorImage.model";
import NotFoundError from "../error/notFound.error";

export class CoupleAdminController2 {
    private coupleAdminService: CoupleAdminService;

    constructor(coupleAdminService: CoupleAdminService) {
        this.coupleAdminService = coupleAdminService;
    }

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
    async getCouples(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> {
        let result: ICoupleResponseWithCount = {
            couples: [],
            count: 0
        };

        if (searchOptions.name && searchOptions.name !== "undefined") {
            result = await this.coupleAdminService.selectWithName(pageOptions, searchOptions, filterOptions);
        } else {
            result = await this.coupleAdminService.select(pageOptions, filterOptions);
        }

        return result;
    }
}

const controller = {
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
