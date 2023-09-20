import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { Shopping } from "../models/shopping.model.js";

class ShoppingService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<Shopping>[]): Promise<Shopping[]> {
    const restaurants: Shopping[] = await Shopping.bulkCreate(
      data as Optional<InferAttributes<Shopping>, NullishPropertiesOf<InferCreationAttributes<Shopping>>>[],
      {
        updateOnDuplicate: [
          "address",
          "areaCode",
          "contentTypeId",
          "description",
          "homepage",
          "mapLevel",
          "mapX",
          "mapY",
          "parking",
          "registrationTime",
          "restDate",
          "sigunguCode",
          "telephone",
          "thumbnail",
          "title",
          "useTime",
          "babyCarriage",
          "pet",
          "saleItem"
        ],
        transaction
      }
    );

    return restaurants;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default ShoppingService;
