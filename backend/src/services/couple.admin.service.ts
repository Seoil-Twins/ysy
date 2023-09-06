import dayjs from "dayjs";
import { File } from "formidable";
import { boolean } from "boolean";
import { GroupedCountResultItem, Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import { Service } from "./service";

import { Couple, FilterOptions, ICoupleResponseWithCount, IUpdateWithAdmin, PageOptions, SearchOptions } from "../models/couple.model";

import { API_ROOT } from "..";
import { isDefaultFile, uploadFile } from "../utils/firebase.util";

import { User } from "../models/user.model";
import { Album } from "../models/album.model";

class CoupleAdminService extends Service {
  private FOLDER_NAME = "couples";

  private createSort(sort: string): OrderItem {
    let result: OrderItem = ["createdTime", "DESC"];

    switch (sort) {
      case "r":
        result = ["createdTime", "DESC"];
        break;
      case "o":
        result = ["createdTime", "ASC"];
        break;
      case "dr":
        result = ["deletedTime", "DESC"];
        break;
      case "do":
        result = ["deletedTime", "ASC"];
        break;
      default:
        result = ["createdTime", "DESC"];
        break;
    }

    return result;
  }

  private createWhere = (filterOptions: FilterOptions, cupId?: string): WhereOptions => {
    let result: WhereOptions = {};

    if (cupId) result["cupId"] = cupId;
    if (boolean(filterOptions.isDeleted)) result["deleted"] = true;
    else if (!boolean(filterOptions.isDeleted)) result["deleted"] = false;
    if (filterOptions.fromDate && filterOptions.toDate) result["createdTime"] = { [Op.between]: [filterOptions.fromDate, filterOptions.toDate] };

    return result;
  };

  getURL(cupId: string): string {
    return `${API_ROOT}/admin/couple/${cupId}?sort=r&count=10&page=1`;
  }

  async select(pageOptions: PageOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> {
    const offset = (pageOptions.page - 1) * pageOptions.count;
    const sort: OrderItem = this.createSort(pageOptions.sort);
    const where = this.createWhere(filterOptions);
    const reuslt: ICoupleResponseWithCount = {
      couples: [],
      count: 0
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

    reuslt.count = count;
    reuslt.couples = rows;

    return reuslt;
  }

  async selectWithName(pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions: FilterOptions): Promise<ICoupleResponseWithCount> {
    const offset = (pageOptions.page - 1) * pageOptions.count;
    const sort: OrderItem = this.createSort(pageOptions.sort);
    const where = this.createWhere(filterOptions);
    const result: ICoupleResponseWithCount = {
      couples: [],
      count: 0
    };
    const { rows, count }: { rows: Couple[]; count: GroupedCountResultItem[] } = await Couple.findAndCountAll({
      offset,
      limit: pageOptions.count,
      order: [sort],
      include: {
        model: User,
        as: "users",
        attributes: [],
        where: {
          name: { [Op.like]: `%${searchOptions.name}%` },
          cupId: { [Op.not]: null }
        },
        duplicating: false
      },
      where: where,
      group: "Couple.cup_id"
    });

    let couples: any = [];

    for (const row of rows) {
      const users: User[] = await row.getUsers({});

      couples.push({
        ...row.dataValues,
        users: users
      });
    }

    result.couples = couples;
    count.forEach((countObj: GroupedCountResultItem) => {
      result.count += countObj.count;
    });

    return result;
  }

  async selectAllWithAdditional(coupleIds: string[]): Promise<Couple[]> {
    const couples: Couple[] = await Couple.findAll({
      where: { cupId: coupleIds },
      include: [
        {
          model: Album,
          as: "albums"
        },
        {
          model: User,
          as: "users"
        }
      ]
    });

    return couples;
  }

  create(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async update(transaction: Transaction | null = null, couple: Couple, data: IUpdateWithAdmin): Promise<Couple> {
    const updatedCouple: Couple = await couple.update(data, { transaction });
    return updatedCouple;
  }

  async updateWithFile(transaction: Transaction | null = null, couple: Couple, data: IUpdateWithAdmin, thumbnail: File): Promise<Couple> {
    if (thumbnail) {
      const reqFileName = thumbnail.originalFilename!;
      const isDefault = isDefaultFile(reqFileName);

      if (isDefault) data.thumbnail = null;
      else data.thumbnail = `${this.FOLDER_NAME}/${couple.cupId}/thumbnail/${dayjs().valueOf()}.${reqFileName}`;
    }

    const updatedCouple: Couple = await couple.update(data, { transaction });

    if (data.thumbnail && thumbnail) await uploadFile(data.thumbnail, thumbnail.filepath);

    return updatedCouple;
  }

  async delete(transaction: Transaction | null = null, couple: Couple): Promise<any> {
    await couple.destroy({ transaction });
  }
}

export default CoupleAdminService;
