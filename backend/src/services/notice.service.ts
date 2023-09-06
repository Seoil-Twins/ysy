import { Transaction } from "sequelize";

import { Notice } from "../models/notice.model";
import { NoticeImage } from "../models/noticeImage.model";

import { Service } from "./service";

class NoticeSerivce extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async selectAll(offset: number, count: number): Promise<Notice[]> {
    const notices: Notice[] = await Notice.findAll({
      include: [
        {
          model: NoticeImage,
          as: "noticeImages",
          attributes: { exclude: ["noticeId"] }
        }
      ],
      offset: offset,
      limit: count
    });

    return notices;
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
