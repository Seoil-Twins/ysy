import { InferAttributes, Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import { Service } from "./service.js";
import { Album } from "../models/album.model.js";
import { SearchOptions, FilterOptions, SortItem } from "../types/album.type.js";

import { AlbumImage } from "../models/albumImage.model.js";
import sequelize from "../models/index.js";
import dayjs from "dayjs";
import { API_ROOT } from "../index.js";
import { PageOptions, createSortOptions } from "../utils/pagination.util.js";
import { albumSortOptions } from "../types/sort.type.js";
import { File, uploadFileWithGCP } from "../utils/gcp.util.js";
import { UNKNOWN_NAME } from "../constants/file.constant.js";

class AlbumAdminService extends Service {
  private FOLDER_NAME = "couples";

  getURL(cupId: string): string {
    return `${API_ROOT}/admin/album?sort=r&count=10&page=1&cup_id=${cupId}`;
  }

  getAlbumFolderPath(cupId: string, albumId: number): string {
    return `${this.FOLDER_NAME}/${cupId}/${albumId}`;
  }

  private createThumbnailPath(cupId: string, albumId: number, thumbnail: File): string {
    const reqFileName = thumbnail.originalname!;
    return `${this.FOLDER_NAME}/${cupId}/${albumId}/thumbnail/${dayjs().valueOf()}.${reqFileName}`;
  }

  private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
    let result: WhereOptions = {};

    if (searchOptions.cupId) result["cupId"] = { [Op.like]: `%${searchOptions.cupId}%` };
    if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

    return result;
  }

  async select(
    pageOptions: PageOptions<SortItem>,
    searchOptions: SearchOptions,
    filterOptions: FilterOptions
  ): Promise<{
    albums: Album[];
    total: number;
  }> {
    const offset: number = (pageOptions.page - 1) * pageOptions.count;
    const sortOptions: OrderItem = createSortOptions<SortItem>(pageOptions.sort, albumSortOptions);
    const where: WhereOptions = this.createWhere(searchOptions, filterOptions);

    const albums: Album[] = await Album.findAll({
      where,
      offset,
      limit: pageOptions.count,
      order: [sortOptions],
      attributes: { include: [[sequelize.fn("COUNT", sequelize.col("albumImages.album_id")), "total"]] },
      include: {
        model: AlbumImage,
        as: "albumImages",
        attributes: [],
        duplicating: false
      },
      group: "Album.album_id"
    });

    const total: number = await Album.count({
      where
    });

    return {
      albums,
      total
    };
  }

  async create(transaction: Transaction | null, cupId: string, title: string) {
    const album: Album = await Album.create({ cupId, title }, { transaction });
    return album;
  }

  async createWithThumbnail(transaction: Transaction | null, cupId: string, title: string, thumbnail: File) {
    const createdAlbum: Album = await Album.create(
      {
        cupId,
        title
      },
      { transaction }
    );
    const path: string = this.createThumbnailPath(cupId, createdAlbum.albumId, thumbnail);

    await createdAlbum.update(
      {
        thumbnail: path,
        thumbnailSize: thumbnail.size,
        thumbnailType: thumbnail.mimetype
      },
      { transaction }
    );

    await uploadFileWithGCP({
      filename: path,
      mimetype: thumbnail.mimetype,
      buffer: thumbnail.buffer,
      size: thumbnail.size
    });

    return createdAlbum;
  }

  async selectAll(albumIds: number[]): Promise<Album[]> {
    const albums: Album[] = await Album.findAll({
      where: { albumId: albumIds },
      include: {
        model: AlbumImage,
        as: "albumImages"
      }
    });
    return albums;
  }

  async update(transaction: Transaction | null, album: Album, data: Partial<InferAttributes<Album>>): Promise<Album> {
    const updatedAlbum: Album = await album.update(data, { transaction });

    return updatedAlbum;
  }

  async updateWithThumbnail(transaction: Transaction | null, album: Album, data: Partial<InferAttributes<Album>>, thumbnail: File): Promise<Album> {
    const path: string = this.createThumbnailPath(album.cupId, album.albumId, thumbnail);
    const updatedAlbum: Album = await album.update(
      {
        ...data,
        thumbnail: path,
        thumbnailSize: thumbnail.size,
        thumbnailType: thumbnail.mimetype ? thumbnail.mimetype : UNKNOWN_NAME
      },
      { transaction }
    );

    await uploadFileWithGCP({
      filename: path,
      buffer: thumbnail.buffer,
      mimetype: thumbnail.mimetype,
      size: thumbnail.size
    });

    return updatedAlbum;
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async deleteAll(transaction: Transaction | null, albumIds: number[]): Promise<void> {
    await Album.destroy({
      where: {
        albumId: albumIds
      },
      transaction
    });
  }
}

export default AlbumAdminService;
