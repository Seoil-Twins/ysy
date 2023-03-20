import dayjs from "dayjs";
import { File } from "formidable";
import { FindOptions, InferAttributes, Transaction } from "sequelize";

import { API_ROOT } from "..";

import logger from "../logger/logger";

import sequelize from "../model";
import { AlbumImage } from "../model/albnmImage.model";
import { Album, ICreate } from "../model/album.model";
import { deleteFile, deleteFolder, uploadFile } from "../util/firebase";

import { Service } from "./service";

// Album Select Option Type
type SelectOptions =
    | FindOptions<
          InferAttributes<
              Album,
              {
                  omit: never;
              }
          >
      >
    | undefined;

class AlbumService extends Service {
    private FOLDER_NAME = "couples";

    private getAlbumWithTotal(): SelectOptions {
        const data: SelectOptions = {
            attributes: { include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_id")), "total"]] },
            include: {
                model: AlbumImage,
                as: "albumImages",
                attributes: []
            },
            group: "Album.album_id"
        };

        return data;
    }

    getURL(): string {
        throw new Error("Method not implemented.");
    }

    getFolderUrl(cupId: string): string {
        return `${API_ROOT}/album/${cupId}`;
    }

    getAlbumUrl(cupId: string, albumId: number): string {
        return `${API_ROOT}/album/${cupId}/${albumId}`;
    }

    async select(albumId: number): Promise<Album | null> {
        const options: SelectOptions = this.getAlbumWithTotal();
        const album: Album | null = await Album.findByPk(albumId, options);

        return album;
    }

    async selectAll(cupId: string): Promise<Album[]> {
        const options: SelectOptions = this.getAlbumWithTotal();
        options!.where = { cupId };

        const albums: Album[] = await Album.findAll(options);
        return albums;
    }

    async create(transaction: Transaction | null = null, data: ICreate): Promise<Album> {
        const album: Album = await Album.create(data, { transaction });
        return album;
    }

    update(_transaction: Transaction | null = null): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async updateTitle(transaction: Transaction | null = null, album: Album, title: string): Promise<Album> {
        const updatedAlbum = await album.update({ title }, { transaction });
        return updatedAlbum;
    }

    async updateThumbnail(transaction: Transaction | null = null, album: Album, thumbnail: File): Promise<Album> {
        let isUpload = false;
        const path = `${this.FOLDER_NAME}/${album.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;
        const prevThumbnail: string | null = album.thumbnail;

        try {
            const updatedAlbum: Album = await album.update(
                {
                    thumbnail: path
                },
                { transaction }
            );

            await uploadFile(path, thumbnail.filepath);
            isUpload = true;

            if (prevThumbnail) {
                await deleteFile(prevThumbnail);
                logger.debug(`Deleted Previous thumbnail => ${prevThumbnail}`);
            }

            return updatedAlbum;
        } catch (error) {
            if (isUpload) {
                await deleteFile(path);
                logger.error(`After updating the firebase, a db error occurred and the firebase image is deleted => ${path}`);
            }

            throw error;
        }
    }

    async delete(transaction: Transaction | null = null, album: Album): Promise<void> {
        const path = `${this.FOLDER_NAME}/${album.cupId}/${album.albumId}`;

        await album.destroy({ transaction });

        if (album.thumbnail) await deleteFile(album.thumbnail);
        await deleteFolder(path);
    }
}

export default AlbumService;
