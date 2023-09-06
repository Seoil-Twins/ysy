import fetch from "node-fetch";
import { URLSearchParams } from "url";

import { Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constants/statusCode.constant";

import sequelize from "../models";
import { Shopping, PageOptions, SearchOptions, IUpdateWithAdmin } from "../models/shopping.model";

import ShoppingAdminService from "../services/shopping.admin.service";

import logger from "../logger/logger";

import BadRequestError from "../errors/badRequest.error";
import NotFoundError from "../errors/notFound.error";
import { Wanted } from "../models/favorite.model";

const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
class ShoppingAdminController {
  private shoppingAdminService: ShoppingAdminService;
  private CONTENT_TYPE_ID: string = "38";

  constructor(shoppingAdminService: ShoppingAdminService) {
    this.shoppingAdminService = shoppingAdminService;
  }

  async getShoppingFromAPI(pageOptions: PageOptions, contentTypeId: String | undefined): Promise<any> {
    const params = {
      numOfRows: pageOptions.numOfRows.toString(),
      pageNo: pageOptions.page.toString(),
      MobileOS: TOURAPI_CODE.MobileOS,
      MobileApp: TOURAPI_CODE.MobileAPP,
      ServiceKey: String(SERVICEKEY),
      listYN: TOURAPI_CODE.YES,
      arrange: TOURAPI_CODE.sort,
      contentTypeId: String(contentTypeId),
      areaCode: TOURAPI_CODE.EMPTY,
      sigunguCode: TOURAPI_CODE.EMPTY,
      cat1: TOURAPI_CODE.EMPTY,
      cat2: TOURAPI_CODE.EMPTY,
      cat3: TOURAPI_CODE.EMPTY,
      _type: TOURAPI_CODE.type
    };

    const queryString = new URLSearchParams(params).toString();
    const requrl = `${url}?${queryString}`;

    try {
      let res = await fetch(requrl);
      const result: any = await Promise.resolve(res.json());
      for (let key in result.response.body.items.item[0]) {
        console.log(key + " : " + result.response.body.items.item[0][key]);
      }

      return result;
    } catch (err) {
      logger.debug(`Error Shopping  :  ${err}`);
      throw err;
    }
  }

  async createShoppingDB(pageOptions: PageOptions, contentTypeId: String | undefined): Promise<Shopping[]> {
    let transaction: Transaction | undefined = undefined;
    try {
      transaction = await sequelize.transaction();

      const result: Shopping[] = await this.shoppingAdminService.create(transaction, pageOptions, contentTypeId);

      await transaction.commit();
      logger.debug(`Created Shopping => ${JSON.stringify(result)}`);

      //const url: string = this.shoppingAdminService.getURL();
      return result;
    } catch (err) {
      logger.debug(`Error Shopping  :  ${err}`);

      if (transaction) await transaction.rollback();
      throw err;
    }
  }

  async getAllShopping(sort: string, searchOptions: SearchOptions): Promise<any> {
    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();
      const result: Shopping | Shopping[] = await this.shoppingAdminService.select(sort, searchOptions, transaction);
      await transaction.commit();

      return result;
    } catch (err) {
      if (transaction) await transaction.rollback();
      logger.debug(`Error Shopping  :  ${err}`);
      throw err;
    }
  }

  async updateShopping(searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<Shopping> {
    let updatedShopping: Shopping | null = null;
    const shopping: Shopping | null = await this.shoppingAdminService.selectOne(searchOptions);
    let nowDate = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, "");

    if (!shopping) throw new BadRequestError(`parameter content_id is bad`);
    let transaction: Transaction | undefined = undefined;
    if (!data.areaCode) {
      data.areaCode = shopping.areaCode;
    }
    if (!data.sigunguCode) data.sigunguCode = shopping.sigunguCode;
    if (!data.view) data.view = shopping.view;
    if (!data.title) data.title = shopping.title;
    if (!data.address) data.address = shopping.address;
    if (!data.mapX) data.mapX = shopping.mapX;
    if (!data.mapY) data.mapY = shopping.mapY;
    if (!data.description) data.description = shopping.description;
    if (!data.thumbnail) data.thumbnail = shopping.thumbnail;
    if (!data.pet) data.pet = shopping.pet;
    if (!data.phoneNumber) data.phoneNumber = shopping.phoneNumber;
    if (!data.babyCarriage) data.babyCarriage = shopping.babyCarriage;
    if (!data.useTime) data.useTime = shopping.useTime;
    if (!data.saleItem) data.saleItem = shopping.saleItem;
    if (!data.parking) data.parking = shopping.parking;
    if (!data.restDate) data.restDate = shopping.restDate;
    if (!data.scale) data.scale = shopping.scale;
    if (!data.openDateShopping) data.openDateShopping = shopping.openDateShopping;
    if (!data.shopGuide) data.shopGuide = shopping.shopGuide;
    if (!data.homepage) data.homepage = shopping.homepage;
    data.modifiedTime = nowDate;

    try {
      transaction = await sequelize.transaction();

      updatedShopping = await this.shoppingAdminService.update(transaction, shopping, data);
      await transaction.commit();

      logger.debug(`Update Shopping => content_id :  ${searchOptions.contentId}`);
      return updatedShopping;
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async deleteShopping(contentIds: string[]): Promise<void> {
    const shoppings: Shopping[] = await this.shoppingAdminService.selectMul(contentIds);
    if (shoppings.length <= 0) throw new NotFoundError("Not found Shoppings.");

    let transaction: Transaction | undefined = undefined;

    try {
      transaction = await sequelize.transaction();

      for (const shopping of shoppings) {
        await this.shoppingAdminService.delete(transaction, shopping);
      }

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  async createWantedShopping(contentId: string, userId: number): Promise<Wanted> {
    let transaction: Transaction | undefined = undefined;
    try {
      transaction = await sequelize.transaction();

      const result: Wanted = await this.shoppingAdminService.createWanted(transaction, userId, contentId, this.CONTENT_TYPE_ID);

      await transaction.commit();
      logger.debug(`Created Shopping => ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      logger.debug(`Error Shopping  :  ${err}`);

      if (transaction) await transaction.rollback();
      throw err;
    }
  }
}

export default ShoppingAdminController;
