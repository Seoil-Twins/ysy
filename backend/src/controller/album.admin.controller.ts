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
    FilterOptions,
    IAdminUpdate
} from "../model/album.model";

import logger from "../logger/logger";
import { deleteFile, deleteFolder, uploadFile } from "../util/firebase";
import { GroupedCountResultItem, Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import { AlbumImage } from "../model/albnmImage.model";

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

const thumbnailError = async (path: string) => {
    await deleteFile(path);
};

const imagesError = async (path: string) => {
    await deleteFolder(path);
};

const addImages = async (cupId: string, albumId: number, images: File | File[], transaction: Transaction) => {
    let isImagesUpload = false;

    try {
        if (images && images instanceof Array<File>) {
            for (let i = 0; i < images.length; i++) {
                try {
                    const path = `${FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}.${images[i].originalFilename}`;
                    await uploadFile(path, images[i].filepath);
                    isImagesUpload = true;

                    await AlbumImage.create(
                        {
                            albumId: albumId,
                            image: path
                        },
                        { transaction }
                    );
                } catch (error) {
                    logger.error(`Add album error and ignore => ${JSON.stringify(error)}`);
                    logger.error(`Ignore File Info => ${JSON.stringify(images[i])}`);
                    continue;
                }
            }
        } else if (images && images instanceof File) {
            const path = `${FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}.${images.originalFilename}`;
            await uploadFile(path, images.filepath);
            isImagesUpload = true;

            await AlbumImage.create(
                {
                    albumId: albumId,
                    image: path
                },
                { transaction }
            );
        }

        return true;
    } catch (error) {
        logger.error(`Album Create Error ${JSON.stringify(error)}`);

        const path = `${FOLDER_NAME}/${cupId}/${albumId}`;
        if (isImagesUpload) await imagesError(path);

        throw error;
    }
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

        const { rows }: { rows: Album[] } = await Album.findAndCountAll({
            where,
            offset,
            limit: pageOptions.count,
            order: [sort],
            attributes: { include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_id")), "total"]] },
            include: {
                model: AlbumImage,
                as: "albumImages",
                attributes: [],
                duplicating: false
            },
            group: "Album.album_id"
        });

        const count: number = await Album.count();

        const result: IAlbumResponseWithCount = {
            albums: rows,
            total: count
        };

        return result;
    },
    createAlbum: async (data: ICreate, thumbnail?: File, images?: File | File[]): Promise<void> => {
        let isThumbnailUpload = false;
        let isImagesUpload = false;
        let thumbnailPath = "";
        let albumId: number = 0;
        const transaction = await sequelize.transaction();

        try {
            const album = await Album.create(data, { transaction });
            albumId = album.albumId;

            if (thumbnail) {
                thumbnailPath = `${FOLDER_NAME}/${data.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;
                await uploadFile(thumbnailPath, thumbnail.filepath);
                isThumbnailUpload = true;

                await album.update(
                    {
                        thumbnail: thumbnailPath
                    },
                    { transaction }
                );
                logger.debug(`Upload Firebase Album Thumbnail => ${JSON.stringify(thumbnail)}`);
            }

            if (images) isImagesUpload = await addImages(data.cupId, album.albumId, images, transaction);

            transaction.commit();
        } catch (error) {
            logger.error(`Album Create Error ${JSON.stringify(error)}`);

            const imagesPath = `${FOLDER_NAME}/${data.cupId}/${albumId}`;

            if (isThumbnailUpload) await thumbnailError(thumbnailPath);
            if (isImagesUpload) await imagesError(imagesPath);

            transaction.rollback();
            throw error;
        }
    },
    addAlbumImages: async (cupId: string, albumId: number, images: File | File[]): Promise<void> => {
        const transaction = await sequelize.transaction();

        try {
            await addImages(cupId, albumId, images, transaction);
            transaction.commit();
        } catch (error) {
            transaction.rollback();
            throw error;
        }
    },
    updateAlbum: async (data: IAdminUpdate, thumbnail?: File): Promise<void> => {
        let isThumbnailUpload = false;
        let thumbnailPath = "";
        const updateData: any = {
            title: undefined,
            thumbnail: undefined
        };
        const transaction = await sequelize.transaction();
        const album: Album | null = await Album.findByPk(data.albumId);

        try {
            if (!album) throw new NotFoundError("Not Found Album");

            if (data.title) updateData.title = data.title;
            if (thumbnail) {
                thumbnailPath = `${FOLDER_NAME}/${data.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;
                await uploadFile(thumbnailPath, thumbnail.filepath);
                isThumbnailUpload = true;
                updateData.thumbnail = thumbnailPath;

                logger.debug(`Upload Firebase Album Thumbnail => ${JSON.stringify(thumbnail)}`);
            }

            const prevThumbnail: string | null = album.thumbnail;
            await album.update(updateData, { transaction });

            if (prevThumbnail) await deleteFile(prevThumbnail);

            transaction.commit();
        } catch (error) {
            logger.error(`Album Create Error ${JSON.stringify(error)}`);

            if (isThumbnailUpload) await thumbnailError(thumbnailPath);

            transaction.rollback();
            throw error;
        }
    }
};

export default controller;
