
import { TOURAPI_CODE } from "../constant/statusCode.constant";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import fetch from "node-fetch";

import { API_ROOT } from "..";
import { Service } from "./service";

import sequelize from "../model";

import { ICultureResponseWithCount, PageOptions, SearchOptions, Culture } from "../model/culture.model";
import NotFoundError from "../error/notFound.error";
import BadRequestError from "../error/badRequest.error";
import logger from "../logger/logger";

const url = process.env.TOURAPI_URL;
const detail_url = process.env.TOURAPI_DETAIL_URL;
const detail_common_url = process.env.TOURAPI_DETAIL_COMMON_URL;
const SERVICEKEY = process.env.TOURAPI_API_KEY;

class RestaurantAdminService extends Service {
    private FOLDER_NAME = "restaurant";

    private createSort(sort: string): OrderItem {
        let result: OrderItem = ["title", "ASC"];

        switch (sort) {
            case "ta":
                result = ["title", "ASC"];
                break;
            case "td":
                result = ["title", "DESC"];
                break;
            case "r":
                result = ["createdTime", "DESC"];
                break;
            case "o":
                result = ["createdTime", "ASC"];
                break;
            default:
                result = ["title", "ASC"];
                break;
        }

        return result;
    }

    private createWhere(searchOptions: SearchOptions): WhereOptions {
        let result: WhereOptions = {};
        if (searchOptions.contentId && searchOptions.contentId !== "undefined") result["contentId"] = searchOptions.contentId;
        else if (searchOptions.title && searchOptions.title !== "undefined") result["title"] = { [Op.substring]: `%${searchOptions.title}%` };

        if (searchOptions.contentId == "undefined" && searchOptions.title == "undefined") result = {};

        return result;
    }

    getURL(): string {
        return `${API_ROOT}/admin/restaurant/search/all?page=1&numOfRows=1&sort=r&contentTypeId=39`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<Culture[]> {
      
            const sort: OrderItem = this.createSort(pageOptions.sort);
            const where: WhereOptions = this.createWhere(searchOptions);

            const result: Culture[] | Culture = await Culture.findAll({
                order: [sort],
                where
            });

            return result;
   
    }

    async selectOne(searchOptions: SearchOptions): Promise<Culture> {
        
            const where: WhereOptions = this.createWhere(searchOptions);

            const result: Culture | null = await Culture.findOne({
                where
            });

            if (!result) throw new NotFoundError(`Not Exist Restaurant`);

            return result;
  
    }
    async selectMul(contentIds: string[]): Promise<Culture[]> {
     
            // const where: WhereOptions = { contentId: contentIds };
            if (!contentIds) throw new BadRequestError("BadRequest contentIds");

            const restaurants: Culture[] = await Culture.findAll({
                where: { contentId: contentIds }
            });

            if (!restaurants) throw new NotFoundError(`Not Exist Restaurant`);

            return restaurants;
     
    }

    async create(transaction: Transaction | null = null, pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
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
        logger.debug(`Response URL => ${requrl}`);

        try {
            let res = await fetch(requrl);
            const result: any = await Promise.resolve(res.json());

            transaction = await sequelize.transaction();

            let i = 1;
            for (let k = 0; k < result.response.body.items.item.length; ++k) {
                const detail_params = {
                    ServiceKey: String(SERVICEKEY),
                    _type: TOURAPI_CODE.type,
                    MobileOS: TOURAPI_CODE.MobileOS,
                    MobileApp: TOURAPI_CODE.MobileAPP,
                    contentTypeId: result.response.body.items.item[k].contenttypeid,
                    contentId: result.response.body.items.item[k].contentid
                };
                const detail_queryString = new URLSearchParams(detail_params).toString();
                const detail_requrl = `${detail_url}?${detail_queryString}`;
                let detail_res = await fetch(detail_requrl);
                const detail_result: any = await Promise.resolve(detail_res.json());

                const detail_common_params = {
                    ServiceKey: String(SERVICEKEY),
                    _type: TOURAPI_CODE.type,
                    MobileOS: TOURAPI_CODE.MobileOS,
                    MobileApp: TOURAPI_CODE.MobileAPP,
                    contentTypeId: result.response.body.items.item[k].contenttypeid,
                    contentId: result.response.body.items.item[k].contentid,
                    defaultYN: TOURAPI_CODE.YES,
                    firstImageYN: TOURAPI_CODE.YES,
                    areacodeYN: TOURAPI_CODE.YES,
                    catcodeYN: TOURAPI_CODE.YES,
                    addrinfoYN: TOURAPI_CODE.YES,
                    mapinfoYN: TOURAPI_CODE.YES,
                    overviewYN: TOURAPI_CODE.YES
                };
                const detail_common_queryString = new URLSearchParams(detail_common_params).toString();
                const detail_common_requrl = `${detail_common_url}?${detail_common_queryString}`;
                let detail_common_res = await fetch(detail_common_requrl);
                const detail_common_result: any = await Promise.resolve(detail_common_res.json());

                const createdCulture: Culture = await Culture.create(
                    {
                        contentTypeId: result.response.body.items.item[k].contenttypeid,
                        areaCode: result.response.body.items.item[k].areacode,
                        sigunguCode: result.response.body.items.item[k].sigungucode,
                        view: 0,
                        title: result.response.body.items.item[k].title,
                        address: result.response.body.items.item[k].addr1,
                        mapX: result.response.body.items.item[k].mapx,
                        mapY: result.response.body.items.item[k].mapy,
                        contentId: result.response.body.items.item[k].contentid,
                        description: detail_common_result.response.body.items.item[0].overview,
                        thumbnail: result.response.body.items.item[k].firstimage,
                        phoneNumber: result.response.body.items.item[k].tel,
                        babyCarriage: detail_result.response.body.items.item[0].babyCarriage,
                        pet: detail_result.response.body.items.item[0].pet,
                        useTime: detail_result.response.body.items.item[0].opentimefood,
                        useFee: detail_result.response.body.items.item[0].useFee,
                        parking: detail_result.response.body.items.item[0].parkingfood,
                        restDate: detail_result.response.body.items.item[0].restdatefood,
                        homepage: detail_common_result.response.body.items.item[0].homepage,
                        createdTime: result.response.body.items.item[k].createdtime
                    },
                    { transaction }
                );
                i++;
            }
            transaction.commit();
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async update(transaction: Transaction | null = null, restaurant: Culture, data: IUpdateWithAdmin): Promise<any> {
        const updateRestaurant: Culture = await restaurant.update(data, { transaction });

        return updateRestaurant;
    }

    async delete(transaction: Transaction | null = null, restaurant: Culture): Promise<void> {
        await restaurant.destroy({ transaction });
    }
}

export default RestaurantAdminService;
