import { Op, OrderItem, Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { Restaurant, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/restaurant.model";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import BadRequestError from "../error/badRequest.error";

import RestaurantAdminService from "../service/restaurant.admin.service";
import logger from "../logger/logger";
import NotFoundError from "../error/notFound.error";

const url = process.env.TOURAPI_URL;
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);

class RestaurantAdminController {
    private restaurantAdminService: RestaurantAdminService;

    constructor(restaurantAdminService: RestaurantAdminService) {
        this.restaurantAdminService = restaurantAdminService;
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
    async getRestaurantFromAPI(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        const offset = (pageOptions.page - 1) * pageOptions.numOfRows;
        //        const where: WhereOptions = createWhere(searchOptions);

        // const { rows, count }: { rows: User[]; count: number } = await User.findAndCountAll({
        //     offset: offset,
        //     limit: pageOptions.count,
        //     order: [sort],
        //     where
        // });

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
            // console.log(result.response.body.items.item[0].contentid);
            for (let key in result.response.body.items.item[0]) {
                console.log(key + " : " + result.response.body.items.item[0][key]);
            }

            return result;
        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);
        }
    }

    /**
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    async createRestaurantDB(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Promise<any> = await this.restaurantAdminService.create(transaction, pageOptions, searchOptions);

            await transaction.commit();
            logger.debug(`Created Restaurant`);

            const url: string = this.restaurantAdminService.getURL();
            return url;
        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }
    /* // not used
    async getRestaurantWithTitle(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        try {
            const res: Restaurant[] | null = await Restaurant.findAll({
                where: {
                    title: { [Op.substring]: searchOptions.title }
                }
            });
            return res;
        } catch (error) {
            console.log("error : ", error);
            throw error;
        }
    }

    async getRestaurantWithContentId(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        try {
            if (searchOptions.contentId == null) throw BadRequestError;

            const rest: Restaurant | null = await Restaurant.findOne({
                where: {
                    contentId: searchOptions.contentId
                }
            });
            return rest;
        } catch (error) {
            console.log("error : ", error);
            throw error;
        }
    }
*/

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

    async updateRestaurant(pageOption: PageOptions, searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<any> {
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
        const allDeleteFiles: string[] = [];
        const albumFolders: string[] = [];
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
        }
    }

    async createWantedRestaurant(contentId: string, userId: number): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Promise<any> = await this.restaurantAdminService.createWanted(transaction, userId, contentId);

            await transaction.commit();
            logger.debug(`Created Restaurant`);

        } catch (err) {
            logger.debug(`Error Restaurant  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }
}

export default RestaurantAdminController;
