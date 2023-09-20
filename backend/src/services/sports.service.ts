import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { Sports } from "../models/sports.model.js";

class SportsService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<Sports>[]): Promise<Sports[]> {
    const restaurants: Sports[] = await Sports.bulkCreate(data as Optional<InferAttributes<Sports>, NullishPropertiesOf<InferCreationAttributes<Sports>>>[], {
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
        "availableAge",
        "pet"
      ],
      transaction
    });

    return restaurants;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default SportsService;
