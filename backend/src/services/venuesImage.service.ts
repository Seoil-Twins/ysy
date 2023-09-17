import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import { Service } from "./service.js";
import { VenuesImage } from "../models/venuesImage.model.js";

class VenuesImageService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(transaction: Transaction | null, data: Partial<VenuesImage>[]): Promise<VenuesImage[]> {
    const images: VenuesImage[] = await VenuesImage.bulkCreate(
      data as Optional<InferAttributes<VenuesImage>, NullishPropertiesOf<InferCreationAttributes<VenuesImage>>>[],
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

export default VenuesImageService;
