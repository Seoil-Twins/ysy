import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { Restaurant } from "../models/restaurant.model.js";

class RestaurantService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<Restaurant>[]): Promise<Restaurant[]> {
    const restaurants: Restaurant[] = await Restaurant.bulkCreate(
      data as Optional<InferAttributes<Restaurant>, NullishPropertiesOf<InferCreationAttributes<Restaurant>>>[],
      {
        updateOnDuplicate: [
          "address",
          "areaCode",
          "contentTypeId",
          "description",
          "homepage",
          "kidsFacility",
          "mapLevel",
          "mapX",
          "mapY",
          "parking",
          "registrationTime",
          "restDate",
          "signatureDish",
          "sigunguCode",
          "smoking",
          "telephone",
          "thumbnail",
          "title",
          "useTime"
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

export default RestaurantService;
