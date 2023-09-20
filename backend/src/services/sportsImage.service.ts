import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { SportsImage } from "../models/sportsImage.model.js";

class SportsImageService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<SportsImage>[]): Promise<SportsImage[]> {
    const images: SportsImage[] = await SportsImage.bulkCreate(
      data as Optional<InferAttributes<SportsImage>, NullishPropertiesOf<InferCreationAttributes<SportsImage>>>[],
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

export default SportsImageService;
