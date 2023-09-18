import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { RestaurantImage } from "../models/restaurantImage.model.js";

class RestaurantImageService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<RestaurantImage>[]): Promise<RestaurantImage[]> {
    const images: RestaurantImage[] = await RestaurantImage.bulkCreate(
      data as Optional<InferAttributes<RestaurantImage>, NullishPropertiesOf<InferCreationAttributes<RestaurantImage>>>[],
      {
        updateOnDuplicate: ["path"],
        transaction
      }
    );

    return images;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default RestaurantImageService;
