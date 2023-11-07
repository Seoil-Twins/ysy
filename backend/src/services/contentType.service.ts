import { Transaction, WhereOptions } from "sequelize";

import { Service } from "./service.js";
import { ContentType } from "../models/contentType.model.js";

class ContentTypeService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  async select(where?: WhereOptions<ContentType>): Promise<ContentType | null> {
    const contentType: ContentType | null = await ContentType.findOne({
      where
    });

    return contentType;
  }

  async selectAll(where?: WhereOptions<ContentType>): Promise<ContentType[]> {
    const contentTypes: ContentType[] = await ContentType.findAll({
      where
    });

    return contentTypes;
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

export default ContentTypeService;
