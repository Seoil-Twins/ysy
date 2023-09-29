import { OrderItem, Transaction } from "sequelize";

import { Notice } from "../models/notice.model.js";
import { NoticeImage } from "../models/noticeImage.model.js";

import { Service } from "./service.js";
import { PageOptions, ResponseNotice } from "../types/noitce.type.js";
import { createSortOptions } from "../utils/pagination.util.js";

class NoticeSerivce extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async selectAll(pageOptions: PageOptions): Promise<ResponseNotice> {
    const sortOptions: OrderItem = createSortOptions(pageOptions.sort);
    const offset: number = (pageOptions.page - 1) * pageOptions.count;

    const { rows, count }: { rows: Notice[]; count: number } = await Notice.findAndCountAll({
      offset: offset,
      limit: pageOptions.count,
      order: [sortOptions]
    });

    return {
      notices: rows,
      total: count
    };
  }

  create(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  update(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null = null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default NoticeSerivce;
