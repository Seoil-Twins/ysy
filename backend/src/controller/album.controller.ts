import dayjs from "dayjs";
import { ListResult, StorageReference } from "firebase/storage";
import { File } from "formidable";
import { Op } from "sequelize";
import NotFoundError from "../error/notFound";

import { Album, IRequestCreate, IRequestGet, IResponse } from "../model/album.model";
import { getFiles, uploadFile } from "../util/firebase";

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
    addAlbums: async (cupId: string, albumId: number, files: File | File[]) => {
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
    }
};

export default controller;
