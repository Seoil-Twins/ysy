import dayjs from "dayjs";
import { ListResult, StorageReference } from "firebase/storage";
import { File } from "formidable";

import ForbiddenError from "../error/forbidden";
import NotFoundError from "../error/notFound";

import sequelize from "../model";
import { Album, IRequestCreate, IRequestGet, IRequestUpadteThumbnail, IRequestUpadteTitle, IResponse } from "../model/album.model";
import { ErrorImage } from "../model/errorImage.model";

import logger from "../logger/logger";
import { deleteFile, deleteFolder, getAllFiles, getFiles, uploadFile } from "../util/firebase";

const folderName = "couples";

const controller = {
    getAlbumsFolder: async (cupId: string): Promise<Album[]> => {
        const albums: Album[] = await Album.findAll({
            where: { cupId: cupId }
        });

        if (albums.length <= 0) throw new NotFoundError("Not Found Albums");

        return albums;
    },
    getAlbums: async (data: IRequestGet): Promise<IResponse> => {
        const album: Album | null = await Album.findOne({
            where: {
                cupId: data.cupId,
                albumId: data.albumId
            }
        });

        if (!album) throw new NotFoundError("Not Found Albums");

        const refName = `${folderName}/${data.cupId}/${data.albumId}`;
        const firebaseResult: ListResult = await getFiles(refName, data.count, data.nextPageToken);
        const files: StorageReference[] = firebaseResult.items;
        const nextPageToken: string | undefined = firebaseResult.nextPageToken;

        if (files.length <= 0) throw new NotFoundError("Not Found Error");

        const items: string[] = [];

        files.forEach((file) => {
            items.push(file.fullPath);
        });

        const result: IResponse = {
            ...album.dataValues,
            items: items,
            nextPageToken: nextPageToken
        };

        return result;
    },
    addAlbumFolder: async (data: IRequestCreate): Promise<void> => {
        await Album.create({
            cupId: data.cupId,
            title: data.title
        });
    },
    addAlbums: async (cupId: string, albumId: number, files: File | File[]): Promise<void> => {
        const albumFolder = await Album.findByPk(albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("Forbidden Error");

        if (files instanceof Array<File>) {
            for (let i = 0; i < files.length; i++) {
                try {
                    const fileName = `/${cupId}/${albumId}/${dayjs().valueOf()}.${files[i].originalFilename}`;
                    await uploadFile(fileName, folderName, files[i].filepath);
                } catch (error) {
                    continue;
                }
            }
        } else if (files instanceof File) {
            const fileName = `/${cupId}/${albumId}/${dayjs().valueOf()}.${files.originalFilename}`;
            await uploadFile(fileName, folderName, files.filepath);
        }
    },
    updateTitle: async (data: IRequestUpadteTitle): Promise<void> => {
        const albumFolder = await Album.findByPk(data.albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== data.cupId) throw new ForbiddenError("Forbidden Error");

        await albumFolder.update({
            title: data.title
        });
    },
    updateThumbnail: async (data: IRequestUpadteThumbnail): Promise<void> => {
        let isUpload = false;
        const path = `/${data.cupId}/${data.albumId}/thumbnail/${dayjs().valueOf()}.${data.thumbnail.originalFilename}`;
        const albumFolder = await Album.findByPk(data.albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== data.cupId) throw new ForbiddenError("Forbidden Error");

        const prevThumbnail: string | null = albumFolder.thumbnail;
        const t = await sequelize.transaction();

        try {
            await albumFolder.update(
                {
                    thumbnail: path
                },
                { transaction: t }
            );
            await uploadFile(path, folderName, data.thumbnail.filepath);
            isUpload = true;

            if (prevThumbnail) await deleteFile(prevThumbnail, folderName);
            t.commit();
        } catch (error) {
            t.rollback();
            if (isUpload) await deleteFile(path, folderName);
        }
    },
    deleteAlbum: async (cupId: string, albumId: number): Promise<void> => {
        const albumFolder = await Album.findByPk(albumId);

        if (!albumFolder) throw new NotFoundError("Not Found Error");
        else if (albumFolder.cupId !== cupId) throw new ForbiddenError("Forbidden Error");

        await albumFolder.destroy();

        if (albumFolder.thumbnail) await deleteFile(albumFolder.thumbnail, folderName);

        const path = `/${cupId}/${albumId}`;
        await deleteFolder(path, folderName);
        const images = await getAllFiles(path, folderName);

        // 지워지지 않은 이미지가 존재할 시
        if (images.items.length) {
            images.items.forEach(async (image) => {
                logger.warn(`Image not deleted : ${cupId} | ${albumId} => ${image.fullPath}`);

                await ErrorImage.create({
                    albumId: albumId,
                    thumbnail: image.fullPath
                });
            });
        }
    }
};

export default controller;
