import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { CultureImage } from "../models/cultureImage.model.js";

class CultureImageService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<CultureImage>[]): Promise<CultureImage[]> {
    const images: CultureImage[] = await CultureImage.bulkCreate(
      data as Optional<InferAttributes<CultureImage>, NullishPropertiesOf<InferCreationAttributes<CultureImage>>>[],
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

export default CultureImageService;
