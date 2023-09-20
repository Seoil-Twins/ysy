import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import InternalServerError from "../errors/internalServer.error.js";

import sequelize from "../models/index.js";
import { ContentType } from "../models/contentType.model.js";
import { Sports } from "../models/sports.model.js";
import { SportsImage } from "../models/sportsImage.model.js";

import {
  ResponsePlace,
  fetchDetailCommon,
  fetchDetailImage,
  fetchAreaBased,
  ResponseDetailCommon,
  ResponseDetailImage,
  replaceEmptyStringToNull,
  ResponseDetailIntroWithSports,
  fetchDetailIntroWithSports
} from "../utils/tourAPI.js";

import ContentTypeService from "../services/contentType.service.js";
import SportsService from "../services/sports.service.js";
import SportsImageService from "../services/sportsImage.service.js";

class SportsController {
  private contentTypeSerivce: ContentTypeService;
  private sportsService: SportsService;
  private sportsImageService: SportsImageService;

  constructor(contentTypeSerivce: ContentTypeService, sportsService: SportsService, sportsImageService: SportsImageService) {
    this.contentTypeSerivce = contentTypeSerivce;
    this.sportsService = sportsService;
    this.sportsImageService = sportsImageService;
  }

  async addSports(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "레포츠" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const sportsDatas: Partial<InferAttributes<Sports>>[] = [];
      const imageDatas: Optional<InferAttributes<SportsImage>, NullishPropertiesOf<InferCreationAttributes<SportsImage>>>[] = [];
      const sportsWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId
      });

      for (const response of sportsWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<Sports>> = {
          contentId: response.contentid,
          contentTypeId: response.contenttypeid,
          title: response.title,
          thumbnail: response.firstimage ? response.firstimage : null,
          mapX: response.mapx,
          mapY: response.mapy,
          mapLevel: response.mlevel,
          areaCode: response.areacode,
          sigunguCode: response.sigungucode,
          registrationTime: createdTime
        };

        const [imageInfo, commonInfo, introInfo]: [
          ResponseDetailImage | undefined,
          ResponseDetailCommon | undefined,
          ResponseDetailIntroWithSports | undefined
        ] = await Promise.all([
          fetchDetailImage(response.contentid),
          fetchDetailCommon(response.contentid),
          fetchDetailIntroWithSports(response.contentid, response.contenttypeid)
        ]);

        replaceEmptyStringToNull(imageInfo);
        replaceEmptyStringToNull(commonInfo);
        replaceEmptyStringToNull(introInfo);

        if (imageInfo) {
          imageDatas.push({
            contentId: response.contentid,
            path: imageInfo.originimgurl
          });
        }
        if (commonInfo) {
          data.address = `${commonInfo.addr1} ${commonInfo.addr2}`.trim();
          data.description = commonInfo.overview;
          data.homepage = commonInfo.homepage;
        }
        if (introInfo) {
          data.parking = introInfo.parkingleports;
          data.restDate = introInfo.restdateleports;
          data.telephone = introInfo.infocenterleports;
          data.useTime = introInfo.usetimeleports;
          data.pet = introInfo.chkpetleports;
          data.babyCarriage = introInfo.chkbabycarriageleports;
          data.useFee = introInfo.usefeeleports;
          data.availableAge = introInfo.expagerangeleports;
        }

        sportsDatas.push(data);
      }

      await this.sportsService.upserts(transaction, sportsDatas);
      await this.sportsImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default SportsController;
