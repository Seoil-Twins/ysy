import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { Service } from "./service.js";

import { RegionCode } from "../models/regionCode.model.js";
import { NullishPropertiesOf } from "sequelize/lib/utils";

class RegionCodeService extends Service {
  getURL(...args: any[]): string {
    throw new Error("Method not implemented.");
  }

  select(...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  create(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async upserts(
    transaction: Transaction | null,
    data: Optional<InferAttributes<RegionCode>, NullishPropertiesOf<InferCreationAttributes<RegionCode>>>[]
  ): Promise<RegionCode[]> {
    const regionCodes: RegionCode[] = await RegionCode.bulkCreate(data, {
      fields: ["name", "mainCode", "subCode"],
      updateOnDuplicate: ["mainCode", "subCode"],
      transaction
    });

    return regionCodes;
  }

  update(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }

  delete(transaction: Transaction | null, ...args: any[]): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

export default RegionCodeService;
