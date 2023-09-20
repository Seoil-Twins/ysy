import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { TouristSpotImage } from "../models/touristSpotImage.model.js";

class TouristSpotImageService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<TouristSpotImage>[]): Promise<TouristSpotImage[]> {
    const images: TouristSpotImage[] = await TouristSpotImage.bulkCreate(
      data as Optional<InferAttributes<TouristSpotImage>, NullishPropertiesOf<InferCreationAttributes<TouristSpotImage>>>[],
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

export default TouristSpotImageService;
