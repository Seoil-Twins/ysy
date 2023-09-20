import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import InternalServerError from "../errors/internalServer.error.js";

import sequelize from "../models/index.js";
import { ContentType } from "../models/contentType.model.js";
import { CultureImage } from "../models/cultureImage.model.js";
import { Culture } from "../models/culture.model.js";

import {
  ResponsePlace,
  fetchDetailCommon,
  fetchDetailImage,
  fetchAreaBased,
  ResponseDetailCommon,
  ResponseDetailImage,
  replaceEmptyStringToNull,
  ResponseDetailIntroWithCulture,
  fetchDetailIntroWithCulture
} from "../utils/tourAPI.js";

import ContentTypeService from "../services/contentType.service.js";
import CultureService from "../services/culture.service.js";
import CultureImageService from "../services/cultureImage.service.js";

class CultureController {
  private contentTypeSerivce: ContentTypeService;
  private cultureService: CultureService;
  private cultureImageService: CultureImageService;

  constructor(contentTypeSerivce: ContentTypeService, cultureService: CultureService, cultureImageService: CultureImageService) {
    this.contentTypeSerivce = contentTypeSerivce;
    this.cultureService = cultureService;
    this.cultureImageService = cultureImageService;
  }

  async addCulture(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "문화시설" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const cultureDatas: Partial<InferAttributes<Culture>>[] = [];
      const imageDatas: Optional<InferAttributes<CultureImage>, NullishPropertiesOf<InferCreationAttributes<CultureImage>>>[] = [];
      const cultureWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId
      });

      for (const response of cultureWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<Culture>> = {
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
          ResponseDetailIntroWithCulture | undefined
        ] = await Promise.all([
          fetchDetailImage(response.contentid),
          fetchDetailCommon(response.contentid),
          fetchDetailIntroWithCulture(response.contentid, response.contenttypeid)
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
          data.parking = introInfo.parkingculture;
          data.restDate = introInfo.restdateculture;
          data.telephone = introInfo.infocenterculture;
          data.useTime = introInfo.usetimeculture;
          data.useFee = introInfo.usefee;
          data.pet = introInfo.chkpetculture;
          data.babyCarriage = introInfo.chkbabycarriageculture;
        }

        cultureDatas.push(data);
      }

      await this.cultureService.upserts(transaction, cultureDatas);
      await this.cultureImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default CultureController;
