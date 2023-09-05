import dayjs from "dayjs";
import { File } from "formidable";
import { FindOptions, InferAttributes, OrderItem, Transaction } from "sequelize";

import { API_ROOT } from "..";

import sequelize from "../models";
import { AlbumImage } from "../models/albumImage.model";
import { Album } from "../models/album.model";
import { Couple } from "../models/couple.model";
import { uploadFile } from "../utils/firebase.util";

import { Service } from "./service";
import { PageOptions } from "../types/album.type";
import { createSortOptions } from "../utils/sort.util";

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

  private createTotalOptions(): SelectOptions {
    const options: SelectOptions = {
      attributes: { include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_image_id")), "total"]] },
      include: {
        model: AlbumImage,
        as: "albumImages",
        attributes: []
      },
      group: "Album.album_id"
    };

    return options;
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
    const album: Album | null = await Album.findByPk(albumId);
    return album;
  }

  async selectWithTotal(albumId: number): Promise<Album | null> {
    const options: SelectOptions = this.createTotalOptions();
    const album: Album | null = await Album.findByPk(albumId, options);

    return album;
  }

  async selectAllWithTotal(cupId: string, pageOptions: PageOptions): Promise<{ albums: Album[]; total: number }> {
    const sortOptions: OrderItem = createSortOptions(pageOptions.sort);
    const offset: number = (pageOptions.page - 1) * pageOptions.count;

    const { rows, count }: { rows: Album[]; count: number } = await Album.findAndCountAll({
      where: { cupId },
      order: [sortOptions],
      offset,
      limit: pageOptions.count
    });
    return { albums: rows, total: count };
  }

  async selectWithCouple(couple: Couple): Promise<Album[]> {
    const albums: Album[] = await couple.getAlbums();
    return albums;
  }

  async create(transaction: Transaction | null, cupId: string, title: string): Promise<Album> {
    const album: Album = await Album.create({ cupId, title }, { transaction });
    return album;
  }

  async update(transaction: Transaction | null, album: Album, data: Partial<InferAttributes<Album>>): Promise<Album> {
    const updatedAlbum = await album.update(data, { transaction });
    return updatedAlbum;
  }

  async updateWithThumbnail(transaction: Transaction | null, album: Album, thumbnail: File): Promise<Album> {
    const path = `${this.FOLDER_NAME}/${album.cupId}/${album.albumId}/thumbnail/${dayjs().valueOf()}.${thumbnail.originalFilename}`;

    const updatedAlbum: Album = await album.update(
      {
        thumbnail: path,
        thumbnailSize: thumbnail.size,
        thumbnailType: thumbnail.mimetype ? thumbnail.mimetype : "unknown"
      },
      { transaction }
    );

    await uploadFile(path, thumbnail.filepath);
    return updatedAlbum;
  }

  async delete(transaction: Transaction | null, album: Album): Promise<void> {
    await album.destroy({ transaction });
  }
}

export default AlbumService;
