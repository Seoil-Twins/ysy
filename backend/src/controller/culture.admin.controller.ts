import { Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { Culture, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/culture.model";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import CultureAdminService from "../service/culture.admin.service";
import logger from "../logger/logger";
import BadRequestError from "../error/badRequest.error";
import NotFoundError from "../error/notFound.error";

const FOLDER_NAME = "culture";
const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const detail_url = "http://apis.data.go.kr/B551011/KorService1/detailIntro1";
const detail_common_url = "http://apis.data.go.kr/B551011/KorService1/detailCommon1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);

class CultureAdminController {
    private cultureAdminService: CultureAdminService;

    constructor(cultureAdminService: CultureAdminService) {
        this.cultureAdminService = cultureAdminService;
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
    async getCultureFromAPI (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        const offset = (pageOptions.page - 1) * pageOptions.numOfRows;

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

        try {
            let res = await fetch(requrl);
            const result: any = await Promise.resolve(res.json());
            console.log(result.response.body.items.item[0].contentid);
            for (let key in result.response.body.items.item[0]) {
                console.log(key + " : " + result.response.body.items.item[0][key]);
            }

            return result;
        } catch (err) {
            logger.debug(`Error Culture Controller  :  ${err}`);
        }
    }

    /**
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    async createCultureDB (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Promise<any> = await this.cultureAdminService.create(transaction, pageOptions, searchOptions);

            await transaction.commit();
            logger.debug(`Created Restaurant`);

            const url: string = this.cultureAdminService.getURL();
            return url;
        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAllCulture(pageOption: PageOptions, searchOptions: SearchOptions): Promise<any> {
        try {
            const result: Culture | Culture[] = await this.cultureAdminService.select(pageOption, searchOptions);

            return result;
        } catch (err) {
            logger.debug(`Error Culture  :  ${err}`);
            throw err;
        }
    }

    async updateCulture(pageOption: PageOptions, searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<any> {
        let updatedRestaurant: Culture | null = null;
        const culture: Culture | null = await this.cultureAdminService.selectOne(searchOptions);

        if (!culture) throw new BadRequestError(`parameter content_id is bad`);
        let transaction: Transaction | undefined = undefined;
        if (!data.areaCode) { data.areaCode = culture.areaCode; }
        if (!data.sigunguCode) data.sigunguCode = culture.sigunguCode;
        if (!data.view) data.view = culture.view;
        if (!data.title) data.title = culture.title;
        if (!data.address) data.address = culture.address;
        if (!data.mapX) data.mapX = culture.mapX;
        if (!data.mapY) data.mapY = culture.mapY;
        if (!data.description) data.description = culture.description;
        if (!data.thumbnail) data.thumbnail = culture.thumbnail;
        if (!data.pet) data.pet = culture.pet;
        if (!data.phoneNumber) data.phoneNumber = culture.phoneNumber;
        if (!data.babyCarriage) data.babyCarriage = culture.babyCarriage;
        if (!data.useTime) data.useTime = culture.useTime;
        if (!data.useFee) data.useFee = culture.useFee;
        if (!data.parking) data.parking = culture.parking;
        if (!data.restDate) data.restDate = culture.restDate;
        if (!data.scale) data.scale = culture.scale;
        if (!data.spendTime) data.spendTime = culture.spendTime;
        if (!data.homepage) data.homepage = culture.homepage;
        data.modifiedTime = "지금22"
        // if (!data.createdTime) data.createdTime = restaurant.createdTime;

        try {
            transaction = await sequelize.transaction();

            updatedRestaurant = await this.cultureAdminService.update(transaction, culture, data);
            await transaction.commit();

            logger.debug(`Update Restaurant => content_id :  ${searchOptions.contentId}`);
            return updatedRestaurant;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async deleteCulture(contentIds: string[]): Promise<void> {
        const allDeleteFiles: string[] = [];
        const albumFolders: string[] = [];
        const restaurants: Culture[] = await this.cultureAdminService.selectMul(contentIds);
        if (restaurants.length <= 0) throw new NotFoundError("Not found restaurants.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const restaurant of restaurants) {
                await this.cultureAdminService.delete(transaction, restaurant);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
        }
    }
}

export default CultureAdminController;
