import dayjs from "dayjs";
import { File } from "formidable";
import { FindOptions, InferAttributes, Transaction } from "sequelize";

import { API_ROOT } from "..";

import logger from "../logger/logger";

import sequelize from "../models";
import { AlbumImage } from "../models/albnmImage.model";
import { Album, ICreate } from "../models/album.model";
import { Couple } from "../models/couple.model";
import { deleteFile, deleteFolder, uploadFile } from "../utils/firebase.util";

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

    getAlbumFolderPath(cupId: string, albumId: number): string {
        return `${this.FOLDER_NAME}/${cupId}/${albumId}`;
    }

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

    async selectWithCouple(couple: Couple): Promise<Album[]> {
        const albums: Album[] = await couple.getAlbums();
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
        const path = `${this.FOLDER_NAME}/${album.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;

        const updatedAlbum: Album = await album.update(
            {
                thumbnail: path
            },
            { transaction }
        );

        await uploadFile(path, thumbnail.filepath);
        return updatedAlbum;
    }

    async delete(transaction: Transaction | null = null, album: Album): Promise<void> {
        await album.destroy({ transaction });
    }
}

export default AlbumService;
