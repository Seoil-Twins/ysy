import dayjs from "dayjs";
import { File } from "formidable";
import { Transaction } from "sequelize";

import ForbiddenError from "../error/forbidden";
import NotFoundError from "../error/notFound";

import sequelize from "../model";
import { Album, ICreate, IRequestGet, IRequestUpadteThumbnail, IRequestUpadteTitle, IResponse } from "../model/album.model";
import { AlbumImage } from "../model/albnmImage.model";

import logger from "../logger/logger";
import { deleteFile, deleteFiles, deleteFolder, uploadFile, uploadFiles } from "../util/firebase";

const FOLDER_NAME = "couples";

const controller = {
    /**
     * 앨범 폴더를 가져옵니다.
     * @param cupId Couple Id
     * @returns A {@link Album}
     */
    getAlbumsFolder: async (cupId: string): Promise<Album[]> => {
        const albums: Album[] = await Album.findAll({
            where: { cupId: cupId },
            attributes: { include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_id")), "total"]] },
            include: {
                model: AlbumImage,
                as: "albumImages",
                attributes: []
            },
            group: "Album.album_id"
        });

        if (albums.length <= 0) throw new NotFoundError("Not Found Albums");

        return albums;
    },
    /**
     * 한 앨범의 목록을 가져옵니다.
     * @param data A {@link IRequestGet}
     * @returns A {@link IResponse}
     */
    getAlbums: async (data: IRequestGet): Promise<IResponse> => {
        const album: Album | null = await Album.findOne({
            where: { cupId: data.cupId }
        });

        if (!album) throw new NotFoundError("Not Found Albums");

        const { rows, count }: { rows: AlbumImage[]; count: number } = await AlbumImage.findAndCountAll({
            where: { albumId: data.albumId },
            attributes: { exclude: ["albumId"] }
        });

        const result: IResponse = {
            ...album.dataValues,
            images: rows,
            total: count
        };

        return result;
    },
    /**
     * 앨범 폴더를 만듭니다.
     *
     * @param data A {@link IRequestCreate}
     */
    addAlbumFolder: async (data: ICreate): Promise<void> => {
        await Album.create(data);
        logger.debug(`Create Data => ${JSON.stringify(data)}`);
    },
    /**
     * 앨범 폴더에 하나 또는 여러 개의 이미지를 추가합니다.
     * @param cupId Couple Id
     * @param albumId Album Id
     * @param files 앨범 이미지 파일
     */
    addAlbums: async (cupId: string, albumId: number, files: File | File[]): Promise<void> => {
        const transaction = await sequelize.transaction();
        const albumFolder = await Album.findByPk(albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        try {
            if (files instanceof Array<File>) {
                const filePaths: string[] = [];
                const imagePaths: string[] = [];

                files.forEach((file: File) => {
                    filePaths.push(file.filepath);
                    imagePaths.push(`${FOLDER_NAME}/${cupId}/${albumId}/${dayjs().valueOf()}.${file.originalFilename}`);
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

                transaction.commit();
            } else if (files instanceof File) {
                const path = `${FOLDER_NAME}//${cupId}/${albumId}/${dayjs().valueOf()}.${files.originalFilename}`;

                await AlbumImage.create(
                    {
                        albumId: albumId,
                        image: path
                    },
                    { transaction }
                );

                await uploadFile(path, files.filepath);
            }

            await transaction.commit();
            logger.debug(`Success add albums => ${cupId} | ${albumId} | ${JSON.stringify(files)}`);
        } catch (error) {
            await transaction.rollback();
            logger.error(`Album Create Error ${JSON.stringify(error)}`);
            throw error;
        }
    },
    /**
     * 앨범 폴더명을 수정합니다.
     * @param data A {@link IRequestUpadteTitle}
     */
    updateTitle: async (data: IRequestUpadteTitle): Promise<void> => {
        const albumFolder = await Album.findByPk(data.albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== data.cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        await albumFolder.update({
            title: data.title
        });

        logger.debug(`Update Data => ${JSON.stringify(data)}`);
    },
    /**
     * 앨범 대표 사진을 수정 또는 추가합니다.
     * @param data A {@link IRequestUpadteThumbnail}
     */
    updateThumbnail: async (data: IRequestUpadteThumbnail): Promise<void> => {
        let isUpload = false;
        const path = `${FOLDER_NAME}/${data.cupId}/${data.albumId}/thumbnail/${dayjs().valueOf()}.${data.thumbnail.originalFilename}`;
        const albumFolder = await Album.findByPk(data.albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== data.cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        const prevThumbnail: string | null = albumFolder.thumbnail;
        const transaction = await sequelize.transaction();

        try {
            await albumFolder.update(
                {
                    thumbnail: path
                },
                { transaction }
            );
            isUpload = true;

            await uploadFile(path, data.thumbnail.filepath);

            if (prevThumbnail) {
                await deleteFile(prevThumbnail);
                logger.debug(`Deleted Previous thumbnail => ${prevThumbnail}`);
            }

            await transaction.commit();
            logger.debug(`Update Data => ${JSON.stringify(data)}`);
        } catch (error) {
            if (isUpload) {
                await deleteFile(path);
                logger.error(`After updating the firebase, a db error occurred and the firebase image is deleted => ${path}`);
            }

            await transaction.rollback();
            throw error;
        }
    },
    /**
     * 앨범을 삭제합니다.
     * @param cupId Couple ID
     * @param albumId Album ID
     */
    deleteAlbum: async (cupId: string, albumId: number): Promise<void> => {
        const albumFolder = await Album.findByPk(albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        if (albumFolder.thumbnail) await deleteFile(albumFolder.thumbnail);

        const path = `${FOLDER_NAME}/${cupId}/${albumId}`;
        const transaction: Transaction = await sequelize.transaction();

        try {
            await albumFolder.destroy();
            await deleteFolder(path);

            await transaction.commit();
            logger.debug(`Success Deleted albums => ${cupId}, ${albumId}`);
        } catch (error) {
            await transaction.rollback();

            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            throw error;
        }
    },
    deleteAlbumImages: async (cupId: string, albumId: number, imageIds: number[]): Promise<void> => {
        const albumFolder: Album | null = await Album.findByPk(albumId);
        if (albumFolder && albumFolder.cupId !== cupId) throw new ForbiddenError("The ID of the album folder and the body ID don't match.");

        const images: AlbumImage[] = await AlbumImage.findAll({ where: { imageId: imageIds } });
        if (!images.length || images.length <= 0) throw new NotFoundError("Not found images");

        const paths = images.map((image: AlbumImage) => {
            return image.image;
        });

        const transaction: Transaction = await sequelize.transaction();

        try {
            await AlbumImage.destroy({ where: { imageId: imageIds }, transaction });
            await deleteFiles(paths);

            transaction.commit();
        } catch (error) {
            logger.error(`Delete album error => ${JSON.stringify(error)}`);
            transaction.rollback();

            throw error;
        }
    }
};

export default controller;
