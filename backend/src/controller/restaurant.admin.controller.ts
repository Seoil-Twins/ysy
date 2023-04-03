import { Op, OrderItem, Transaction } from "sequelize";

import sequelize from "../model";
import { Restaurant, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/restaurant.model";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import BadRequestError from "../error/badRequest.error";

import RestaurantAdminService from "../service/restaurant.admin.service";
import logger from "../logger/logger";
import NotFoundError from "../error/notFound.error";

const url = process.env.TOURAPI_URL;
const detail_url = process.env.TOURAPI_DETAIL_URL;
const detail_common_url = process.env.TOURAPI_DETAIL_COMMON_URL;
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
            MobileOS: "ETC",
            MobileApp: "AppTest",
            ServiceKey: String(SERVICEKEY),
            listYN: "Y",
            arrange: "A",
            contentTypeId: searchOptions.contentTypeId!,
            areaCode: "",
            sigunguCode: "",
            cat1: "",
            cat2: "",
            cat3: "",
            _type: "json"
        };

        const queryString = new URLSearchParams(params).toString();
        const requrl = `${url}?${queryString}`;
        console.log(requrl);

        try {
            let res = await fetch(requrl);
            const result: any = await Promise.resolve(res.json());
            // console.log(result.response.body.items.item[0]);
            // console.log(result.response.body.items.item.length);
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
            console.log("error: ", err);

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
        try {
            const result: Restaurant | Restaurant[] = await this.restaurantAdminService.select(pageOption, searchOptions);

            return result;
        } catch (err) {
            console.log("err : ", err);
            throw err;
        }
    }

    async updateRestaurant(pageOption: PageOptions, searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<any> {
        let updatedRestaurant: Restaurant | null = null;
        const restaurant: Restaurant | null = await this.restaurantAdminService.selectOne(searchOptions);

        if (!restaurant) throw new BadRequestError(`parameter content_id is bad`);
        let transaction: Transaction | undefined = undefined;
        console.log(data.areaCode, " :: ", restaurant.getDataValue("areaCode"));
        console.log(typeof data.areaCode);
        if (data.areaCode == "undefined") {
            console.log("undefined 처리");
            data.areaCode = restaurant.getDataValue("areaCode");
        }
        if (data.sigunguCode == "undefined") data.sigunguCode = restaurant.getDataValue("sigunguCode");
        if (data.view == undefined) data.view = restaurant.getDataValue("view");
        if (data.title == "undefined") data.title = restaurant.getDataValue("title");
        if (data.address == "undefined") data.address = restaurant.getDataValue("address");
        if (data.mapX == "undefined") data.mapX = restaurant.getDataValue("mapX");
        if (data.mapY == "undefined") data.mapY = restaurant.getDataValue("mapY");
        if (data.description == "undefined") data.description = restaurant.getDataValue("description");
        if (data.thumbnail == "undefined") data.thumbnail = restaurant.getDataValue("thumbnail");
        if (data.signatureDish == "undefined") data.signatureDish = restaurant.getDataValue("signatureDish");
        if (data.phoneNumber == "undefined") data.phoneNumber = restaurant.getDataValue("phoneNumber");
        if (data.kidsFacility == "undefined") data.kidsFacility = restaurant.getDataValue("kidsFacility");
        if (data.useTime == "undefined") data.useTime = restaurant.getDataValue("useTime");
        if (data.parking == "undefined") data.parking = restaurant.getDataValue("parking");
        if (data.restDate == "undefined") data.restDate = restaurant.getDataValue("restDate");
        if (data.smoking == "undefined") data.smoking = restaurant.getDataValue("smoking");
        if (data.reservation == "undefined") data.reservation = restaurant.getDataValue("reservation");
        if (data.homepage == "undefined") data.homepage = restaurant.getDataValue("homepage");
        if (data.createdTime == "undefined") data.createdTime = restaurant.getDataValue("createdTime");

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

    async deleteRestaurant(contentIds: String[]): Promise<void> {
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
}

export default RestaurantAdminController;
