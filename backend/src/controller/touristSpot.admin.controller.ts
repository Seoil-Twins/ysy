import fetch from "node-fetch";
import { URLSearchParams } from "url";

import { Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../models";
import { TouristSpot, PageOptions, SearchOptions, IUpdateWithAdmin } from "../models/touristSpot.model";
import { Wanted } from "../models/favorite.model";

import TouristSpotAdminService from "../services/touristSpot.admin.service";

import BadRequestError from "../errors/badRequest.error";
import NotFoundError from "../errors/notFound.error";

import logger from "../logger/logger";

const url = process.env.TOURAPI_URL;
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
class TouristSpotAdminController {
  private touristSpotAdminService: TouristSpotAdminService;
  private CONTENT_TYPE_ID: string = "12";

  constructor(touristSpotAdminService: TouristSpotAdminService) {
    this.touristSpotAdminService = touristSpotAdminService;
  }

  /**
   * @param pageOptions A {@link PageOptions}
   * @param searchOptions A {@link SearchOptions}
   * @returns A {@link IUserResponseWithCount}
   */
  async getTouristSpotFromAPI(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
    const params = {
      numOfRows: pageOptions.numOfRows.toString(),
      pageNo: pageOptions.page.toString(),
      MobileOS: TOURAPI_CODE.MobileOS,
      MobileApp: TOURAPI_CODE.MobileAPP,
      ServiceKey: String(SERVICEKEY),
      listYN: TOURAPI_CODE.YES,
      arrange: TOURAPI_CODE.sort,
      contentTypeId: searchOptions.contentTypeId!,
      areaCode: TOURAPI_CODE.EMPTY,
      sigunguCode: TOURAPI_CODE.EMPTY,
      cat1: TOURAPI_CODE.EMPTY,
      cat2: TOURAPI_CODE.EMPTY,
      cat3: TOURAPI_CODE.EMPTY,
      _type: TOURAPI_CODE.type
    };

    const queryString = new URLSearchParams(params).toString();
    const requrl = `${url}?${queryString}`;
    console.log("요청한 URL : " + requrl);

    try {
      let res = await fetch(requrl);
      const result: any = await Promise.resolve(res.json());
      /* 가져온 내용 찍어주기. */
      // for (let key in result.response.body.items.item[0]) {
      //     console.log(key + " : " + result.response.body.items.item[0][key]);
      // }

      return result;
    } catch (err) {
      logger.debug(`Error TouristSpot  :  ${err}`);
      throw err;
    }
  }

  /**
   * @param pageOptions A {@link PageOptions}
   * @param searchOptions A {@link SearchOptions}
   */
  async createTouristSpotDB(pageOptions: PageOptions, contentTypeId: String | undefined): Promise<TouristSpot[]> {
    let transaction: Transaction | undefined = undefined;
    try {
      transaction = await sequelize.transaction();

      const result: TouristSpot[] = await this.touristSpotAdminService.create(transaction, pageOptions, contentTypeId);

      await transaction.commit();

      return Promise.resolve(result);
    } catch (err) {
      logger.debug(`Error TouristSpot  :  ${err}`);

      if (transaction) await transaction.rollback();
      throw err;
    }
  }

  async getAllTouristSpot(sort: string, searchOptions: SearchOptions): Promise<TouristSpot[]> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const result: TouristSpot | TouristSpot[] = await this.touristSpotAdminService.select(sort, searchOptions, transaction);
      await transaction.commit();

      return result;
    } catch (err) {
      if (transaction) await transaction.rollback();
      logger.debug(`Error TouristSpot  :  ${err}`);
      throw err;
    }
  }

  async updateTouristSpot(contentId: string, data: IUpdateWithAdmin): Promise<TouristSpot> {
    const touristSpot: TouristSpot | null = await this.touristSpotAdminService.selectOne(contentId);

    if (!touristSpot) throw new BadRequestError(`parameter content_id is bad`);
    let nowDate = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, "");
    let transaction: Transaction | undefined = undefined;
    if (!data.areaCode) {
      data.areaCode = touristSpot.areaCode;
    }
    if (!data.sigunguCode) data.sigunguCode = touristSpot.sigunguCode;
    if (!data.view) data.view = touristSpot.view;
    if (!data.title) data.title = touristSpot.title;
    if (!data.address) data.address = touristSpot.address;
    if (!data.mapX) data.mapX = touristSpot.mapX;
    if (!data.mapY) data.mapY = touristSpot.mapY;
    if (!data.description) data.description = touristSpot.description;
    if (!data.thumbnail) data.thumbnail = touristSpot.thumbnail;
    if (!data.pet) data.pet = touristSpot.pet;
    if (!data.phoneNumber) data.phoneNumber = touristSpot.phoneNumber;
    if (!data.babyCarriage) data.babyCarriage = touristSpot.babyCarriage;
    if (!data.useTime) data.useTime = touristSpot.useTime;
    if (!data.parking) data.parking = touristSpot.parking;
    if (!data.restDate) data.restDate = touristSpot.restDate;
    if (!data.expguide) data.expguide = touristSpot.expguide;
    if (!data.homepage) data.homepage = touristSpot.homepage;
    data.modifiedTime = nowDate;

    try {
      transaction = await sequelize.transaction();

      let updatedTouristSpot = await this.touristSpotAdminService.update(transaction, touristSpot, data);
      await transaction.commit();

      logger.debug(`Update TouristSpot => content_id :  ${contentId}`);
      return updatedTouristSpot;
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async deleteTouristSpot(contentIds: string[]): Promise<void> {
    const touristSpots: TouristSpot[] = await this.touristSpotAdminService.selectMul(contentIds);
    if (touristSpots.length <= 0) throw new NotFoundError("Not found TouristSpots.");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      for (const touristSpot of touristSpots) {
        await this.touristSpotAdminService.delete(transaction, touristSpot);
      }

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async createWantedTouristSpot(contentId: string, userId: number): Promise<Wanted> {
    let transaction: Transaction | undefined = undefined;
    try {
      transaction = await sequelize.transaction();

      const result: Wanted = await this.touristSpotAdminService.createWanted(transaction, userId, contentId, this.CONTENT_TYPE_ID);

      await transaction.commit();
      logger.debug(`Created TouristSpot => ${JSON.stringify(result)}`);

      return result;
    } catch (err) {
      logger.debug(`Error TouristSpot  :  ${err}`);

      if (transaction) await transaction.rollback();
      throw err;
    }
  }
}

export default TouristSpotAdminController;
