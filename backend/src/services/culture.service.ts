import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { Culture } from "../models/culture.model.js";

class CultureService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<Culture>[]): Promise<Culture[]> {
    const restaurants: Culture[] = await Culture.bulkCreate(
      data as Optional<InferAttributes<Culture>, NullishPropertiesOf<InferCreationAttributes<Culture>>>[],
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
          "useFee",
          "pet"
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

export default CultureService;
