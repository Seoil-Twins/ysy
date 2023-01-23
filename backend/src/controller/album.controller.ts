import dayjs from "dayjs";
import { StorageReference } from "firebase/storage";
import { File } from "formidable";
import { Op } from "sequelize";
import NotFoundError from "../error/notFound";

import { Album, IRequestCreate, IResponse } from "../model/album.model";
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
    getAlbums: async (cupId: string, albumId: number): Promise<IResponse> => {
        const album: Album | null = await Album.findOne({
            where: {
                cupId: cupId,
                albumId: albumId
            }
        });

        if (!album) throw new NotFoundError("Not Found Albums");

        const refName = `${folderName}/${cupId}/${albumId}`;
        const files: StorageReference[] = await getFiles(refName);

        if (files.length <= 0) throw new NotFoundError("Not Found Error");

        const items: string[] = [];

        files.forEach((file) => {
            items.push(file.fullPath);
        });

        const result: IResponse = {
            ...album.dataValues,
            items: items
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
