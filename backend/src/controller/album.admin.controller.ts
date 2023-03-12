import dayjs from "dayjs";
import { File } from "formidable";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import NotFoundError from "../error/notFound";

import sequelize from "../model";
import { Album, ICreate, IAlbumResponseWithCount, SearchOptions, PageOptions, FilterOptions, IAdminUpdate } from "../model/album.model";

import logger from "../logger/logger";
import { deleteFile, deleteFiles, deleteFolder, isDefaultFile, uploadFile, uploadFiles } from "../util/firebase";
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

const addImages = async (cupId: string, albumId: number, images: File | File[], transaction: Transaction) => {
    try {
        if (images && images instanceof Array<File>) {
            const filePaths: string[] = [];
            const imagePaths: string[] = [];

            images.forEach((image: File) => {
                filePaths.push(image.filepath);
                imagePaths.push(`${FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}.${image.originalFilename}`);
            });

            const [successResults, failedResults]: PromiseSettledResult<any>[][] = await uploadFiles(filePaths, imagePaths);

            failedResults.forEach((failed) => {
                logger.error(`Add album error and ignore => ${JSON.stringify(failed)}`);
            });

            for (const result of successResults) {
                if (result.status === "fulfilled") {
                    await AlbumImage.create(
                        {
                            albumId: albumId,
                            image: result.value.metadata.fullPath
                        },
                        { transaction }
                    );
                }
            }
        } else if (images && images instanceof File) {
            const path = `${FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}.${images.originalFilename}`;

            await AlbumImage.create(
                {
                    albumId: albumId,
                    image: path
                },
                { transaction }
            );

            await uploadFile(path, images.filepath);
        }

        return true;
    } catch (error) {
        logger.error(`Album Create Error ${JSON.stringify(error)}`);
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
        let isImagesUpload = false;
        let isThumbnailUpload = false;
        let thumbnailPath = "";
        let albumId = 0;
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();
            const album = await Album.create(data, { transaction });
            albumId = album.albumId;

            if (thumbnail) {
                thumbnailPath = `${FOLDER_NAME}/${data.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;

                await album.update(
                    {
                        thumbnail: thumbnailPath
                    },
                    { transaction }
                );

                await uploadFile(thumbnailPath, thumbnail.filepath);
                isThumbnailUpload = true;

                logger.debug(`Upload Firebase Album Thumbnail => ${JSON.stringify(thumbnail)}`);
            }

            if (images) isImagesUpload = await addImages(data.cupId, album.albumId, images, transaction);

            await transaction.commit();
        } catch (error) {
            logger.error(`Album Create Error ${JSON.stringify(error)}`);

            if (isThumbnailUpload) await thumbnailError(thumbnailPath);
            if (isImagesUpload) await deleteFolder(`${FOLDER_NAME}/${data.cupId}/${albumId}`);
            if (transaction) await transaction.rollback();
            throw error;
        }
    },
    addAlbumImages: async (cupId: string, albumId: number, images: File | File[]): Promise<void> => {
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();
            await addImages(cupId, albumId, images, transaction);
            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    },
    updateAlbum: async (data: IAdminUpdate, thumbnail?: File): Promise<void> => {
        let isThumbnailUpload = false;
        let thumbnailPath: string | null = null;
        const updateData: any = {
            title: undefined,
            thumbnail: undefined
        };
        let transaction: Transaction | undefined = undefined;
        const album: Album | null = await Album.findByPk(data.albumId);

        try {
            if (!album) throw new NotFoundError("Not Found Album");

            transaction = await sequelize.transaction();

            if (data.title) updateData.title = data.title;
            if (thumbnail) {
                const isDefault = isDefaultFile(thumbnail.originalFilename!);

                if (isDefault) thumbnailPath = null;
                else thumbnailPath = `${FOLDER_NAME}/${data.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;

                updateData.thumbnail = thumbnailPath;

                logger.debug(`Upload Firebase Album Thumbnail => ${JSON.stringify(thumbnail)}`);
            }

            const prevThumbnail: string | null = album.thumbnail;
            await album.update(updateData, { transaction });

            if (prevThumbnail) await deleteFile(prevThumbnail);
            if (thumbnailPath) {
                await uploadFile(thumbnailPath, thumbnail!.filepath);
                isThumbnailUpload = true;
            }

            await transaction.commit();
        } catch (error) {
            logger.error(`Album Update Error ${JSON.stringify(error)}`);

            if (isThumbnailUpload) await thumbnailError(thumbnailPath!);

            if (transaction) await transaction.rollback();
            throw error;
        }
    },
    deleteAlbums: async (albumIds: number[]): Promise<void> => {
        let transaction: Transaction | undefined = undefined;

        try {
            const thumbnailPaths: string[] = [];
            const albumPaths: string[] = [];
            const albums: Album[] = await Album.findAll({ where: { albumId: albumIds } });
            if (!albums.length || albums.length <= 0) throw new NotFoundError("Not found albums");

            transaction = await sequelize.transaction();

            for (const album of albums) {
                await album.destroy({ transaction });

                if (album.thumbnail) thumbnailPaths.push(album.thumbnail);

                const albumPath = `${FOLDER_NAME}/${album.cupId}/${album.albumId}`;
                albumPaths.push(albumPath);
            }

            await deleteFiles(thumbnailPaths);

            const promises = [];
            for (const albumPath of albumPaths) promises.push(deleteFolder(albumPath));
            await Promise.allSettled(promises);

            await transaction.commit();
        } catch (error) {
            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            if (transaction) await transaction.rollback();
        }
    },
    deleteAlbumImages: async (imageIds: number[]): Promise<void> => {
        let transaction: Transaction | undefined = undefined;

        try {
            const images: AlbumImage[] = await AlbumImage.findAll({ where: { imageId: imageIds } });
            if (!images.length || images.length <= 0) throw new NotFoundError("Not found images");

            transaction = await sequelize.transaction();

            const paths = images.map((image: AlbumImage) => {
                return image.image;
            });

            await AlbumImage.destroy({ where: { imageId: imageIds }, transaction });
            await deleteFiles(paths);

            await transaction.commit();
        } catch (error) {
            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            if (transaction) await transaction.rollback();
        }
    }
};

export default controller;
