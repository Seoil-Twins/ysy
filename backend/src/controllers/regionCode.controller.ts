import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";

import sequelize from "../models/index.js";
import { RegionCode } from "../models/regionCode.model.js";

import logger from "../logger/logger.js";

import RegionCodeService from "../services/regionCode.service.js";
import { ResponseRegionCode, fetchRegionCode } from "../utils/tourAPI.js";
import { NullishPropertiesOf } from "sequelize/lib/utils";

class RegionCodeController {
  private regionCodeService: RegionCodeService;

  constructor(regionCodeService: RegionCodeService) {
    this.regionCodeService = regionCodeService;
  }

  async getRegionCode(): Promise<RegionCode[]> {
    const response = await this.regionCodeService.selectAll();
    return response;
  }

  async addRegionCode(): Promise<RegionCode[]> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const data: Optional<InferAttributes<RegionCode>, NullishPropertiesOf<InferCreationAttributes<RegionCode>>>[] = [];
      const citys: ResponseRegionCode[] = await fetchRegionCode();

      for (const city of citys) {
        data.push({
          mainCode: city.code,
          subCode: "0",
          name: city.name
        });

        const sigungus: ResponseRegionCode[] = await fetchRegionCode({ areaCode: city.code });

        sigungus.forEach((sigungu: ResponseRegionCode) => {
          data.push({
            mainCode: city.code,
            subCode: sigungu.code,
            name: sigungu.name
          });
        });
      }

      const response: RegionCode[] = await this.regionCodeService.upserts(transaction, data);
      await transaction.commit();

      return response;
    } catch (error) {
      logger.error(`Faild fetch area code and reason => ${JSON.stringify(error)}`);
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default RegionCodeController;
