import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import InternalServerError from "../errors/internalServer.error.js";

import sequelize from "../models/index.js";
import { TouristSpot } from "../models/touristSpot.model.js";
import { TouristSpotImage } from "../models/touristSpotImage.model.js";
import { ContentType } from "../models/contentType.model.js";

import {
  ResponsePlace,
  fetchDetailCommon,
  fetchDetailImage,
  fetchAreaBased,
  ResponseDetailCommon,
  ResponseDetailImage,
  replaceEmptyStringToNull,
  ResponseDetailIntroWithTouristSpot,
  fetchDetailIntroWithTouristSpot
} from "../utils/tourAPI.js";

import TouristSpotService from "../services/touristSpot.service.js";
import TouristSpotImageService from "../services/touristSpotImage.service.js";
import ContentTypeService from "../services/contentType.service.js";

class TouristSpotController {
  private contentTypeSerivce: ContentTypeService;
  private touristSpotService: TouristSpotService;
  private touristSpotImageService: TouristSpotImageService;

  constructor(contentTypeSerivce: ContentTypeService, touristSpotService: TouristSpotService, touristSpotImageService: TouristSpotImageService) {
    this.contentTypeSerivce = contentTypeSerivce;
    this.touristSpotService = touristSpotService;
    this.touristSpotImageService = touristSpotImageService;
  }

  async addTouristSpot(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "관광지" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const touristSpotDatas: Partial<InferAttributes<TouristSpot>>[] = [];
      const imageDatas: Optional<InferAttributes<TouristSpotImage>, NullishPropertiesOf<InferCreationAttributes<TouristSpotImage>>>[] = [];
      const touristSpotWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId
      });

      for (const response of touristSpotWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<TouristSpot>> = {
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
          ResponseDetailIntroWithTouristSpot | undefined
        ] = await Promise.all([
          fetchDetailImage(response.contentid),
          fetchDetailCommon(response.contentid),
          fetchDetailIntroWithTouristSpot(response.contentid, response.contenttypeid)
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
          data.parking = introInfo.parking;
          data.restDate = introInfo.restdate;
          data.telephone = introInfo.infocenter;
          data.useTime = introInfo.usetime;
          data.babyCarriage = introInfo.chkbabycarriage;
          data.pet = introInfo.chkpet;
          data.useSeason = introInfo.useseason;
        }

        touristSpotDatas.push(data);
      }

      await this.touristSpotService.upserts(transaction, touristSpotDatas);
      await this.touristSpotImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default TouristSpotController;
