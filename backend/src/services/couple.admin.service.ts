import dayjs from "dayjs";
import { boolean } from "boolean";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service.js";
import { API_ROOT } from "../index.js";

import { User } from "../models/user.model.js";
import { Album } from "../models/album.model.js";
import { Couple } from "../models/couple.model.js";
import { AlbumImage } from "../models/albumImage.model.js";

import { coupleSortOptions } from "../types/sort.type.js";
import { FilterOptions, SearchOptions, ResponseCouplesWithAdmin, SortItem, CreateCoupleWithAdmin } from "../types/couple.type.js";

import { PageOptions, createSortOptions } from "../utils/pagination.util.js";
import { File, uploadFileWithGCP } from "../utils/gcp.util.js";

class CoupleAdminService extends Service {
  private FOLDER_NAME = "couples";

  createProfile(cupId: string, thumbnail: File): string {
    const reqFileName = thumbnail.originalname!;
    const path: string = `${this.FOLDER_NAME}/${cupId}/thumbnail/${dayjs().valueOf()}.${reqFileName}`;

    return path;
  }

  private createWhere = (searchOptions: SearchOptions, filterOptions: FilterOptions): WhereOptions => {
    let result: WhereOptions<Couple> = {};

    if (searchOptions.cupId && searchOptions.cupId !== "undefined") {
      result["cupId"] = { [Op.like]: `%${searchOptions.cupId}%` };
    }
    if (boolean(filterOptions.isDeleted)) {
      result["deleted"] = true;
    }
    if (boolean(filterOptions.isThumbnail)) {
      result["thumbnail"] = { [Op.not]: null };
    }
    if (filterOptions.fromDate && filterOptions.toDate) {
      result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };
    }

    return result;
  };

  getURL(cupId: string): string {
    return `${API_ROOT}/admin/couple/${cupId}?sort=r&count=10&page=1`;
  }

  async select(pageOptions: PageOptions<SortItem>, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ResponseCouplesWithAdmin> {
    const offset = (pageOptions.page - 1) * pageOptions.count;
    const sort: OrderItem = createSortOptions<SortItem>(pageOptions.sort, coupleSortOptions);
    const where = this.createWhere(searchOptions, filterOptions);
    const reuslt: ResponseCouplesWithAdmin = {
      couples: [],
      total: 0
    };

    const { rows, count }: { rows: Couple[]; count: number } = await Couple.findAndCountAll({
      offset,
      limit: pageOptions.count,
      order: [sort],
      where,
      include: {
        model: User,
        as: "users"
      },
      distinct: true // Include로 인해 잘못 counting 되는 현상을 막아줌
    });

    reuslt.total = count;
    reuslt.couples = rows;

    return reuslt;
  }

  async selectAllWithAdditional(cupIds: string[]): Promise<Couple[]> {
    const couples: Couple[] = await Couple.findAll({
      where: { cupId: cupIds },
      include: [
        {
          model: Album,
          as: "albums",
          include: [
            {
              model: AlbumImage,
              as: "albumImages"
            }
          ]
        }
      ]
    });

    return couples;
  }

  async create(transaction: Transaction | null, cupId: string, data: CreateCoupleWithAdmin): Promise<Couple> {
    const createdCouple = await Couple.create(
      {
        cupId,
        ...data
      },
      { transaction }
    );

    return createdCouple;
  }

  async createWithThumbnail(transaction: Transaction | null, cupId: string, data: CreateCoupleWithAdmin, thumbnail: File): Promise<Couple> {
    const path: string = this.createProfile(cupId, thumbnail);

    const createdCouple = await Couple.create(
      {
        cupId,
        ...data,
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

    return createdCouple;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async delete(transaction: Transaction | null = null, couple: Couple): Promise<any> {
    await couple.destroy({ transaction });
  }

  async deleteAll(transaction: Transaction | null = null, cupIds: string[]): Promise<any> {
    await Couple.destroy({
      where: {
        cupId: cupIds
      },
      transaction
    });
  }
}

export default CoupleAdminService;
