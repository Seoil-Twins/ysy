import { TOURAPI_CODE } from "../constant/statusCode.constant";

import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import fetch from "node-fetch";

import { API_ROOT } from "..";

import { Service } from "./service";

import sequelize from "../model";
import { PageOptions, SearchOptions, TouristSpot, IUpdateWithAdmin } from "../model/touristSpot.model";
import { Wanted } from "../model/wanted.model";

import logger from "../logger/logger";

import NotFoundError from "../error/notFound.error";
import BadRequestError from "../error/badRequest.error";

const url = process.env.TOURAPI_URL;
const detail_url = process.env.TOURAPI_DETAIL_URL;
const detail_common_url = process.env.TOURAPI_DETAIL_COMMON_URL;
const SERVICEKEY = process.env.TOURAPI_API_KEY;

class TouristSpotAdminService extends Service {

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
        return `${API_ROOT}/admin/tourist_spot/search/all?page=1&numOfRows=1&sort=r&contentTypeId=39`;
    }

    async select(pageOptions: PageOptions, searchOptions: SearchOptions, transaction: Transaction | null = null): Promise<TouristSpot[]> {
      
            const sort: OrderItem = this.createSort(pageOptions.sort);
            const where: WhereOptions = this.createWhere(searchOptions);

            const result: TouristSpot[] | TouristSpot = await TouristSpot.findAll({
                order: [sort],
                where
            });

            let viewUpdate = {
                view : 0
            }
            for(const touristSpot of result){
                viewUpdate.view = touristSpot.view + 1;
                let update: TouristSpot = await touristSpot.update(viewUpdate, { transaction });
            }
            return result;
   
    }

    async selectOne(searchOptions: SearchOptions): Promise<TouristSpot> {
        
            const where: WhereOptions = this.createWhere(searchOptions);

            const result: TouristSpot | null = await TouristSpot.findOne({
                where
            });

            if (!result) throw new NotFoundError(`Not Exist TouristSpot`);

            return result;
  
    }
    async selectMul(contentIds: string[]): Promise<TouristSpot[]> {
     
            // const where: WhereOptions = { contentId: contentIds };
            if (!contentIds) throw new BadRequestError("BadRequest contentIds");

            const touristSpots: TouristSpot[] = await TouristSpot.findAll({
                where: { contentId: contentIds }
            });

            if (!touristSpots) throw new NotFoundError(`Not Exist TouristSpot`);

            return touristSpots;
     
    }

    async create(transaction: Transaction | null = null, pageOptions: PageOptions, searchOptions: SearchOptions): Promise<TouristSpot[]> {
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
            let resTouristSpot: TouristSpot[] = [];
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
                const createdTouristSpot: TouristSpot = await TouristSpot.create(
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
                        babyCarriage: detail_result.response.body.items.item[0].chkbabycarriage,
                        phoneNumber: result.response.body.items.item[k].tel,
                        pet: detail_result.response.body.items.item[0].chkpet,
                        useTime: detail_result.response.body.items.item[0].usetime,
                        parking: detail_result.response.body.items.item[0].parking,
                        restDate: detail_result.response.body.items.item[0].restdate,
                        homepage: detail_common_result.response.body.items.item[0].homepage,
                        expguide:detail_result.response.body.items.item[0].expguide,
                        modifiedTime: "지금.",
                        createdTime: result.response.body.items.item[k].createdtime
                    },
                    { transaction }
                );
                i++;
                resTouristSpot.push(createdTouristSpot);
            }
            transaction.commit();
            return resTouristSpot;
            
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        } 
    }

    async update(transaction: Transaction | null = null, touristSpot: TouristSpot, data: IUpdateWithAdmin): Promise<TouristSpot> {
        const updateTouristSpot: TouristSpot = await touristSpot.update(data, { transaction });

        return updateTouristSpot;
    }

    async delete(transaction: Transaction | null = null, touristSpot: TouristSpot): Promise<void> {
        await touristSpot.destroy({ transaction });
    }
    async createWanted(transaction: Transaction | null = null, userId: number, contentId: string, contentTypeId: string) : Promise<Wanted>
    {
        try{
            transaction = await sequelize.transaction();
            const createdWanted: Wanted = await Wanted.create(
                {
                    userId: userId,
                    content_id: contentId,
                    content_type_id: contentTypeId
                },
                { transaction }
            );
            transaction.commit();
            return createdWanted;
        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }
    }
}

export default TouristSpotAdminService;

