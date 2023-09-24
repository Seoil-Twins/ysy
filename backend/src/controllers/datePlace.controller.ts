import dayjs from "dayjs";
import { InferAttributes, InferCreationAttributes, Optional, Transaction } from "sequelize";
import { NullishPropertiesOf } from "sequelize/lib/utils";

import InternalServerError from "../errors/internalServer.error.js";

import sequelize from "../models/index.js";
import { ContentType } from "../models/contentType.model.js";

import {
  ResponsePlace,
  fetchDetailCommon,
  fetchDetailImage,
  fetchAreaBased,
  fetchDetailIntroWithRestaurant,
  ResponseDetailIntroWithRestaurant,
  ResponseDetailCommon,
  ResponseDetailImage,
  replaceEmptyStringToNull,
  ResponseDetailIntroWithTouristSpot,
  fetchDetailIntroWithTouristSpot,
  ResponseDetailIntroWithCulture,
  fetchDetailIntroWithCulture,
  ResponseDetailIntroWithSports,
  fetchDetailIntroWithSports,
  ResponseDetailIntroWithShopping,
  fetchDetailIntroWithShopping
} from "../utils/tourAPI.js";

import { DatePlace } from "../models/datePlace.model.js";
import { DatePlaceImage } from "../models/datePlaceImage.model.js";

import ContentTypeService from "../services/contentType.service.js";
import DatePlaceService from "../services/datePlace.service.js";
import DatePlaceImageService from "../services/datePlaceImage.service.js";

import { FilterOptions, PageOptions, ResponseDatePlace, SearchOptions } from "../types/datePlace.type.js";

class DatePlaceController {
  private pageNo = 1;
  private contentTypeSerivce: ContentTypeService;
  private datePlaceService: DatePlaceService;
  private datePlaceImageService: DatePlaceImageService;

  constructor(contentTypeSerivce: ContentTypeService, datePlaceService: DatePlaceService, datePlaceImageService: DatePlaceImageService) {
    this.contentTypeSerivce = contentTypeSerivce;
    this.datePlaceService = datePlaceService;
    this.datePlaceImageService = datePlaceImageService;
  }

  initalPageNo() {
    this.pageNo = 1;
  }

  increasePageNo() {
    this.pageNo += 1;
  }

  async getDatePlaces(userId: number, pageOptions: PageOptions, searchOptions: SearchOptions, filterOptions?: FilterOptions): Promise<ResponseDatePlace> {
    const response: ResponseDatePlace = await this.datePlaceService.select(userId, pageOptions, searchOptions, filterOptions);
    return response;
  }

  async addRestaurants(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "음식점" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const restaurantDatas: Partial<InferAttributes<DatePlace>>[] = [];
      const imageDatas: Optional<InferAttributes<DatePlaceImage>, NullishPropertiesOf<InferCreationAttributes<DatePlaceImage>>>[] = [];
      const restaurantsWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId,
        pageNo: this.pageNo
      });

      for (const response of restaurantsWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<DatePlace>> = {
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
          ResponseDetailIntroWithRestaurant | undefined
        ] = await Promise.all([
          fetchDetailImage(response.contentid),
          fetchDetailCommon(response.contentid),
          fetchDetailIntroWithRestaurant(response.contentid, response.contenttypeid)
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
          if (introInfo.kidsfacility === "0") {
            introInfo.kidsfacility = "없음";
          } else if (introInfo.kidsfacility === "1") {
            introInfo.kidsfacility = "있음";
          }

          data.kidsFacility = introInfo.kidsfacility;
          data.parking = introInfo.parkingfood;
          data.restDate = introInfo.restdatefood;
          data.signatureDish = introInfo.firstmenu;
          data.smoking = introInfo.smoking;
          data.telephone = introInfo.infocenterfood;
          data.useTime = introInfo.opentimefood;
        }

        restaurantDatas.push(data);
      }

      await this.datePlaceService.upsertsWithRestaurant(transaction, restaurantDatas);
      await this.datePlaceImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }

  async addTouristSpot(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "관광지" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const touristSpotDatas: Partial<InferAttributes<DatePlace>>[] = [];
      const imageDatas: Optional<InferAttributes<DatePlaceImage>, NullishPropertiesOf<InferCreationAttributes<DatePlaceImage>>>[] = [];
      const touristSpotWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId,
        pageNo: this.pageNo
      });

      for (const response of touristSpotWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<DatePlace>> = {
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

      await this.datePlaceService.upsertsWithTouristSpot(transaction, touristSpotDatas);
      await this.datePlaceImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }

  async addCulture(): Promise<void> {
    let transaction: Transaction | undefined = undefined;
    let count = 0;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "문화시설" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const cultureDatas: Partial<InferAttributes<DatePlace>>[] = [];
      const imageDatas: Optional<InferAttributes<DatePlaceImage>, NullishPropertiesOf<InferCreationAttributes<DatePlaceImage>>>[] = [];
      const cultureWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId,
        pageNo: this.pageNo
      });

      console.log(cultureWithAPI.length);

      for (const response of cultureWithAPI) {
        count += 1;
        console.log("coount", count);

        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<DatePlace>> = {
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

      await this.datePlaceService.upsertsWithCulture(transaction, cultureDatas);
      await this.datePlaceImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }

  async addSports(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "레포츠" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const sportsDatas: Partial<InferAttributes<DatePlace>>[] = [];
      const imageDatas: Optional<InferAttributes<DatePlaceImage>, NullishPropertiesOf<InferCreationAttributes<DatePlaceImage>>>[] = [];
      const sportsWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId,
        pageNo: this.pageNo
      });

      for (const response of sportsWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<DatePlace>> = {
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

      await this.datePlaceService.upsertsWithSports(transaction, sportsDatas);
      await this.datePlaceImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }

  async addShopping(): Promise<void> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const contentType: ContentType | null = await this.contentTypeSerivce.select({ name: "쇼핑" });
      if (!contentType) {
        throw new InternalServerError("Not found ContentTypeID");
      }

      const shoppingDatas: Partial<InferAttributes<DatePlace>>[] = [];
      const imageDatas: Optional<InferAttributes<DatePlaceImage>, NullishPropertiesOf<InferCreationAttributes<DatePlaceImage>>>[] = [];
      const shoppingWithAPI: ResponsePlace[] = await fetchAreaBased({
        contentTypeId: contentType.contentTypeId,
        pageNo: this.pageNo
      });

      for (const response of shoppingWithAPI) {
        const createdTime = dayjs(response.createdtime, { format: "YYYYMMDDHHmmss" }).toDate();
        const data: Partial<InferAttributes<DatePlace>> = {
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

      await this.datePlaceService.upsertsWithShopping(transaction, shoppingDatas);
      await this.datePlaceImageService.upserts(transaction, imageDatas);
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();

      throw error;
    }
  }
}

export default DatePlaceController;
