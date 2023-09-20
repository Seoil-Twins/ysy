import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { TouristSpot } from "../models/touristSpot.model.js";

class TouristSpotService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<TouristSpot>[]): Promise<TouristSpot[]> {
    const restaurants: TouristSpot[] = await TouristSpot.bulkCreate(
      data as Optional<InferAttributes<TouristSpot>, NullishPropertiesOf<InferCreationAttributes<TouristSpot>>>[],
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
          "useSeason",
          "babyCarriage",
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

export default TouristSpotService;
