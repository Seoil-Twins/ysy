import fetch from "node-fetch";
import { URLSearchParams } from "url";

import { Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { Restaurant, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/restaurant.model";

import RestaurantAdminService from "../service/restaurant.admin.service";

import BadRequestError from "../error/badRequest.error";
import NotFoundError from "../error/notFound.error";

import logger from "../logger/logger";
import { Wanted } from "../model/wanted.model";

const url = process.env.TOURAPI_URL;
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);

class RestaurantAdminController {
    private restaurantAdminService: RestaurantAdminService;
    private CONTENT_TYPE_ID: string = "39"

    constructor(restaurantAdminService: RestaurantAdminService) {
        this.restaurantAdminService = restaurantAdminService;
    }
    /**

     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    async getRestaurantFromAPI(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
 
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
            for (let key in result.response.body.items.item[0]) {
                console.log(key + " : " + result.response.body.items.item[0][key]);
            }

            return result;
        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);
            throw err;
        }
    }

    /**
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    async createRestaurantDB(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<Restaurant[]> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Restaurant[] = await this.restaurantAdminService.create(transaction, pageOptions, searchOptions);

            await transaction.commit();
            logger.debug(`Created Restaurant => ${JSON.stringify(result)}`);

            //const url: string = this.restaurantAdminService.getURL();
            return result;
        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAllRestaurant(pageOption: PageOptions, searchOptions: SearchOptions): Promise<any> {
        
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();
            const result: Restaurant | Restaurant[] = await this.restaurantAdminService.select(pageOption, searchOptions, transaction);
            await transaction.commit();

            return result;
        } catch (err) {
            if (transaction) await transaction.rollback();
            logger.debug(`Error Restaurant  :  ${err}`);
            throw err;
        }
    }

    async updateRestaurant(searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<Restaurant> {
        let updatedRestaurant: Restaurant | null = null;
        const restaurant: Restaurant | null = await this.restaurantAdminService.selectOne(searchOptions);

        if (!restaurant) throw new BadRequestError(`parameter content_id is bad`);
        let transaction: Transaction | undefined = undefined;
        if (!data.areaCode) { data.areaCode = restaurant.areaCode; }
        if (!data.sigunguCode) data.sigunguCode = restaurant.sigunguCode;
        if (!data.view) data.view = restaurant.view;
        if (!data.title) data.title = restaurant.title;
        if (!data.address) data.address = restaurant.address;
        if (!data.mapX) data.mapX = restaurant.mapX;
        if (!data.mapY) data.mapY = restaurant.mapY;
        if (!data.description) data.description = restaurant.description;
        if (!data.thumbnail) data.thumbnail = restaurant.thumbnail;
        if (!data.signatureDish) data.signatureDish = restaurant.signatureDish;
        if (!data.phoneNumber) data.phoneNumber = restaurant.phoneNumber;
        if (!data.kidsFacility) data.kidsFacility = restaurant.kidsFacility;
        if (!data.useTime) data.useTime = restaurant.useTime;
        if (!data.parking) data.parking = restaurant.parking;
        if (!data.restDate) data.restDate = restaurant.restDate;
        if (!data.smoking) data.smoking = restaurant.smoking;
        if (!data.reservation) data.reservation = restaurant.reservation;
        if (!data.homepage) data.homepage = restaurant.homepage;
        // if (!data.createdTime) data.createdTime = restaurant.createdTime;

        try {
            transaction = await sequelize.transaction();

            updatedRestaurant = await this.restaurantAdminService.update(transaction, restaurant, data);
            await transaction.commit();

            logger.debug(`Update Restaurant => content_id :  ${searchOptions.contentId}`);
            return updatedRestaurant;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async deleteRestaurant(contentIds: string[]): Promise<void> {
        const restaurants: Restaurant[] = await this.restaurantAdminService.selectMul(contentIds);
        if (restaurants.length <= 0) throw new NotFoundError("Not found restaurants.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const restaurant of restaurants) {
                await this.restaurantAdminService.delete(transaction, restaurant);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async createWantedRestaurant(contentId: string, userId: number): Promise<Wanted> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Wanted = await this.restaurantAdminService.createWanted(transaction, userId, contentId, this.CONTENT_TYPE_ID);

            await transaction.commit();
            logger.debug(`Created Restaurant => ${JSON.stringify(result)}`);
            return result;

        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }
}

export default RestaurantAdminController;
