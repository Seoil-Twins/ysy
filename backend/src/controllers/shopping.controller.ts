import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import InternalServerError from "../errors/internalServer.error.js";

import sequelize from "../models/index.js";
import { ContentType } from "../models/contentType.model.js";
import { Shopping } from "../models/shopping.model.js";
import { ShoppingImage } from "../models/shoppingImage.model.js";

import {
  ResponsePlace,
  fetchDetailCommon,
  fetchDetailImage,
  fetchAreaBased,
  ResponseDetailCommon,
  ResponseDetailImage,
  replaceEmptyStringToNull,
  ResponseDetailIntroWithShopping,
  fetchDetailIntroWithShopping
} from "../utils/tourAPI.js";

import ContentTypeService from "../services/contentType.service.js";
import ShoppingService from "../services/shopping.service.js";
import ShoppingImageService from "../services/shoppingImage.service.js";

class ShoppingController {
  private contentTypeSerivce: ContentTypeService;
  private shoppingService: ShoppingService;
  private shoppingImageService: ShoppingImageService;

  constructor(contentTypeSerivce: ContentTypeService, shoppingService: ShoppingService, shoppingImageService: ShoppingImageService) {
    this.contentTypeSerivce = contentTypeSerivce;
    this.shoppingService = shoppingService;
    this.shoppingImageService = shoppingImageService;
  }

  async addShopping(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "쇼핑" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const shoppingDatas: Partial<InferAttributes<Shopping>>[] = [];
      const imageDatas: Optional<InferAttributes<ShoppingImage>, NullishPropertiesOf<InferCreationAttributes<ShoppingImage>>>[] = [];
      const shoppingWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId
      });

      for (const response of shoppingWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<Shopping>> = {
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
          ResponseDetailIntroWithShopping | undefined
        ] = await Promise.all([
          fetchDetailImage(response.contentid),
          fetchDetailCommon(response.contentid),
          fetchDetailIntroWithShopping(response.contentid, response.contenttypeid)
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
          data.parking = introInfo.parkingshopping;
          data.restDate = introInfo.restdateshopping;
          data.telephone = introInfo.infocentershopping;
          data.useTime = introInfo.opentime;
          data.pet = introInfo.chkpetshopping;
          data.babyCarriage = introInfo.chkbabycarriageshopping;
          data.saleItem = introInfo.saleitem;
        }

        shoppingDatas.push(data);
      }

      await this.shoppingService.upserts(transaction, shoppingDatas);
      await this.shoppingImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default ShoppingController;
