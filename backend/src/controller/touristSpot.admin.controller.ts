import { Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { TouristSpot, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/touristSpot.model";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import TouristSpotAdminService from "../service/touristSpot.admin.service";
import logger from "../logger/logger";
import BadRequestError from "../error/badRequest.error";
import NotFoundError from "../error/notFound.error";

const FOLDER_NAME = "sports";
const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const detail_url = "http://apis.data.go.kr/B551011/KorService1/detailIntro1";
const detail_common_url = "http://apis.data.go.kr/B551011/KorService1/detailCommon1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
class TouristSpotAdminController {

    private touristSpotAdminService: TouristSpotAdminService;

    constructor(touristSpotAdminService: TouristSpotAdminService) {
        this.touristSpotAdminService = touristSpotAdminService;
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
    async getTouristSpotFromAPI (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
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
    async createTouristSpotDB (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Promise<any> = await this.touristSpotAdminService.create(transaction, pageOptions, searchOptions);

            await transaction.commit();
            logger.debug(`Created TouristSpot`);

            const url: string = this.touristSpotAdminService.getURL();
            return url;
        } catch (err) {
            logger.debug(`Error TouristSpot  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAllTouristSpot(pageOption: PageOptions, searchOptions: SearchOptions): Promise<any> {
        try {
            const result: TouristSpot | TouristSpot[] = await this.touristSpotAdminService.select(pageOption, searchOptions);

            return result;
        } catch (err) {
            logger.debug(`Error Culture  :  ${err}`);
            throw err;
        }
    }

    async updateTouristSpot(pageOption: PageOptions, searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<any> {
        let updatedTouristSpot: TouristSpot | null = null;
        const touristSpot: TouristSpot | null = await this.touristSpotAdminService.selectOne(searchOptions);

        if (!touristSpot) throw new BadRequestError(`parameter content_id is bad`);
        let transaction: Transaction | undefined = undefined;
        if (!data.areaCode) { data.areaCode = touristSpot.areaCode; }
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
        data.modifiedTime = "지금22"
        // if (!data.createdTime) data.createdTime = restaurant.createdTime;

        try {
            transaction = await sequelize.transaction();

            updatedTouristSpot = await this.touristSpotAdminService.update(transaction, touristSpot, data);
            await transaction.commit();

            logger.debug(`Update Restaurant => content_id :  ${searchOptions.contentId}`);
            return updatedTouristSpot;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async deleteTouristSpot(contentIds: string[]): Promise<void> {
        const allDeleteFiles: string[] = [];
        const albumFolders: string[] = [];
        const touristSpots: TouristSpot[] = await this.touristSpotAdminService.selectMul(contentIds);
        if (touristSpots.length <= 0) throw new NotFoundError("Not found restaurants.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const touristSpot of touristSpots) {
                await this.touristSpotAdminService.delete(transaction, touristSpot);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
        }
    }
  
    async createWantedTouristSpot(contentId: string, userId: number): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const contentTypeId = "12";

            const result: Promise<any> = await this.touristSpotAdminService.createWanted(transaction, userId, contentId, contentTypeId);

            await transaction.commit();
            logger.debug(`Created Shopping`);

        } catch (err) {
            logger.debug(`Error Shopping  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }
}

export default TouristSpotAdminController;
