import dayjs from "dayjs";
import { ListResult, StorageReference } from "firebase/storage";
import { File } from "formidable";

import ForbiddenError from "../error/forbidden";
import NotFoundError from "../error/notFound";

import sequelize from "../model";
import {
    Album,
    ICreate,
    IRequestGet,
    IRequestUpadteThumbnail,
    IRequestUpadteTitle,
    IResponse,
    IAlbumResponseWithCount,
    SearchOptions,
    PageOptions,
    FilterOptions
} from "../model/album.model";

import logger from "../logger/logger";
import { deleteFile, deleteFolder, uploadFile } from "../util/firebase";
import { Op, OrderItem, WhereOptions } from "sequelize";

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
        case "cd":
            result = ["cupId", "DESC"];
            break;
        case "ca":
            result = ["cupId", "ASC"];
            break;
        default:
            result = ["createdTime", "DESC"];
            break;
    }

    return result;
};

const createWhere = (searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions => {
    let result: WhereOptions = {};

    if (searchOptions.cupId) result["cupId"] = { [Op.like]: `%${searchOptions.cupId}%` };
    if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

    return result;
};

const controller = {
    /**
     * 모든 Album Folder를 가져옵니다.
     * ```typescript
     * const pageOptions: PageOptions = {
     *      count: 10,
     *      page: 1,
     *      sort: "r" | "o" | "cd" | "ca"
     * };
     * const searchOptions: SearchOptions = {
     *      cupId: "AAABBB"
     * };
     * const filterOptions: FilterOptions = {
     *      fromDate: "2023-03-01",
     *      toDate: "2023-03-03"
     * };
     *
     * const result: IAlbumResponseWithCount = await albumAdminController.getAlbumFolders(pageOptions, searchOptions, filterOptions);
     * ```
     * @param pageOptions {@link PageOptions}
     * @param searchOptions {@link SearchOptions}
     * @param filterOptions {@link FilterOptions}
     * @returns A {@link IAlbumResponseWithCount}
     */
    getAlbumFolders: async (pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<IAlbumResponseWithCount> => {
        const offset: number = (pageOptions.page - 1) * pageOptions.count;
        const sort: OrderItem = createSort(pageOptions.sort);
        const where: WhereOptions = createWhere(searchOptions, filterOptions);

        const { rows, count }: { rows: Album[]; count: number } = await Album.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort]
        });

        const result: IAlbumResponseWithCount = {
            albums: rows,
            count: count
        };

        return result;
    },
    addAlbumFolder: async (data: ICreate): Promise<void> => {},
    addAlbums: async (cupId: string, albumId: number, files: File | File[]): Promise<void> => {},
    updateTitle: async (data: IRequestUpadteTitle): Promise<void> => {},
    updateThumbnail: async (data: IRequestUpadteThumbnail): Promise<void> => {},
    deleteAlbum: async (cupId: string, albumId: number): Promise<void> => {}
};

export default controller;
