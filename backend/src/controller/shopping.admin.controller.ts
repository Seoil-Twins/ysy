import { Op, Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { Shopping, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/shopping.model";

import BadRequestError from "../error/badRequest.error";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import ShoppingAdminService from "../service/shopping.admin.service";
import logger from "../logger/logger";
import NotFoundError from "../error/notFound.error";

const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const detail_url = "http://apis.data.go.kr/B551011/KorService1/detailIntro1";
const detail_common_url = "http://apis.data.go.kr/B551011/KorService1/detailCommon1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
class ShoppingAdminController {
    private shoppingAdminService: ShoppingAdminService;

    constructor(shoppingAdminService: ShoppingAdminService) {
        this.shoppingAdminService = shoppingAdminService;
    }

    /**
     * const pageOptions: PageOptions = {
     *      numOfRows: 1,
     *      count 5,\
     * };
     * const searchOptions: SearchOptions = {
     *      contentTypeId: 39
     * };
     *
     * const result = await getRestaurantWithSearch(pageOptions, SearchOptions);
     * ```
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    async getShoppingFromAPI (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
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
        console.log(requrl);

        try {
            let res = await fetch(requrl);
            const result: any = await Promise.resolve(res.json());
            console.log(result.response.body.items.item[0].contentid);
            for (let key in result.response.body.items.item[0]) {
                console.log(key + " : " + result.response.body.items.item[0][key]);
            }

            return result;
        } catch (err) {
            console.log("error: ", err);
        }
    }

    /**
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    async createShoppingDB (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Promise<any> = await this.shoppingAdminService.create(transaction, pageOptions, searchOptions);

            await transaction.commit();
            logger.debug(`Created Shopping`);

            const url: string = this.shoppingAdminService.getURL();
            return url;
        } catch (err) {
            logger.debug(`Error Shopping  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAllShopping(pageOption: PageOptions, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();
            const result: Shopping | Shopping[] = await this.shoppingAdminService.select(pageOption, searchOptions, transaction);
            await transaction.commit();

            return result;
        } catch (err) {
            if (transaction) await transaction.rollback();
            logger.debug(`Error Culture  :  ${err}`);
            throw err;
        }
    }

    async updateShopping(pageOption: PageOptions, searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<any> {
        let updatedShopping: Shopping | null = null;
        const shopping: Shopping | null = await this.shoppingAdminService.selectOne(searchOptions);

        if (!shopping) throw new BadRequestError(`parameter content_id is bad`);
        let transaction: Transaction | undefined = undefined;
        if (!data.areaCode) { data.areaCode = shopping.areaCode; }
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
        data.modifiedTime = "지금22"
        // if (!data.createdTime) data.createdTime = restaurant.createdTime;

        try {
            transaction = await sequelize.transaction();

            updatedShopping = await this.shoppingAdminService.update(transaction, shopping, data);
            await transaction.commit();

            logger.debug(`Update Restaurant => content_id :  ${searchOptions.contentId}`);
            return updatedShopping;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async deleteShopping(contentIds: string[]): Promise<void> {
        const allDeleteFiles: string[] = [];
        const albumFolders: string[] = [];
        const shoppings: Shopping[] = await this.shoppingAdminService.selectMul(contentIds);
        if (shoppings.length <= 0) throw new NotFoundError("Not found restaurants.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const shopping of shoppings) {
                await this.shoppingAdminService.delete(transaction, shopping);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
        }
    }

    async createWantedShopping(contentId: string, userId: number): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const contentTypeId = "38";

            const result: Promise<any> = await this.shoppingAdminService.createWanted(transaction, userId, contentId, contentTypeId);

            await transaction.commit();
            logger.debug(`Created Shopping`);

        } catch (err) {
            logger.debug(`Error Shopping  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }
}

export default ShoppingAdminController;
