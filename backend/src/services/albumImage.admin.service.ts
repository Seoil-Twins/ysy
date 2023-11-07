import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import { Service } from "./service.js";
import { PageOptions, createSortOptions } from "../utils/pagination.util.js";
import { FilterOptions, ResponseAlbumImage, SearchOptions, SortItem } from "../types/albumImage.type.js";
import { AlbumImage } from "../models/albumImage.model.js";
import { albumImageSortOptions } from "../types/sort.type.js";
import { Album } from "../models/album.model.js";

class AlbumImageAdminService extends Service {
  private createWhere(searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions {
    let result: WhereOptions = {};

    if (searchOptions.albumId) result["albumId"] = { [Op.like]: `%${searchOptions.albumId}%` };
    if (searchOptions.type) result["type"] = { [Op.like]: `%${searchOptions.type}%` };
    if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

    return result;
  }

  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async selectAll(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseAlbumImage> {
    const offset: number = (pageOptions.page - 1) * pageOptions.count;
    const sortOptions: OrderItem = createSortOptions<SortItem>(pageOptions.sort, albumImageSortOptions);
    const where: WhereOptions<AlbumImage> = this.createWhere(searchOptions, filterOptions);
    const includeWhere: WhereOptions<Album> | undefined = searchOptions.cupId
      ? {
          cupId: searchOptions.cupId
        }
      : undefined;

    const { rows, count }: { rows: AlbumImage[]; count: number } = await AlbumImage.findAndCountAll({
      where,
      offset,
      limit: pageOptions.count,
      order: [sortOptions],
      include: {
        model: Album,
        as: "album",
        required: true,
        where: includeWhere,
        attributes: []
      }
    });

    return {
      albumImages: rows,
      total: count
    };
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default AlbumImageAdminService;
