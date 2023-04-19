import { STRING, Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { Sports, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/sports.model";

import SportsAdminService from "../service/sports.admin.service";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import BadRequestError from "../error/badRequest.error";
import logger from "../logger/logger";
import NotFoundError from "../error/notFound.error";

const FOLDER_NAME = "sports";
const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const detail_url = "http://apis.data.go.kr/B551011/KorService1/detailIntro1";
const detail_common_url = "http://apis.data.go.kr/B551011/KorService1/detailCommon1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
class SportsAdminController {
    
    private sportsAdminService: SportsAdminService;

    constructor(sportsAdminService: SportsAdminService) {
        this.sportsAdminService = sportsAdminService;
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
    async getSportsFromAPI(pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
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
    async createSportsDB (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Promise<any> = await this.sportsAdminService.create(transaction, pageOptions, searchOptions);

            await transaction.commit();
            logger.debug(`Created Sports`);

            const url: string = this.sportsAdminService.getURL();
            return url;
        } catch (err) {
            logger.debug(`Error Sports  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAllSports(pageOption: PageOptions, searchOptions: SearchOptions): Promise<any> {
        try {
            const result: Sports | Sports[] = await this.sportsAdminService.select(pageOption, searchOptions);

            return result;
        } catch (err) {
            logger.debug(`Error Culture  :  ${err}`);
            throw err;
        }
    }

    async updateSports(pageOption: PageOptions, searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<any> {
        let updatedSports: Sports | null = null;
        const sports: Sports | null = await this.sportsAdminService.selectOne(searchOptions);

        if (!sports) throw new BadRequestError(`parameter content_id is bad`);
        let transaction: Transaction | undefined = undefined;
        if (!data.areaCode) { data.areaCode = sports.areaCode; }
        if (!data.sigunguCode) data.sigunguCode = sports.sigunguCode;
        if (!data.view) data.view = sports.view;
        if (!data.title) data.title = sports.title;
        if (!data.address) data.address = sports.address;
        if (!data.mapX) data.mapX = sports.mapX;
        if (!data.mapY) data.mapY = sports.mapY;
        if (!data.description) data.description = sports.description;
        if (!data.thumbnail) data.thumbnail = sports.thumbnail;
        if (!data.pet) data.pet = sports.pet;
        if (!data.phoneNumber) data.phoneNumber = sports.phoneNumber;
        if (!data.babyCarriage) data.babyCarriage = sports.babyCarriage;
        if (!data.useTime) data.useTime = sports.useTime;
        if (!data.useFee) data.useFee = sports.useFee;
        if (!data.parking) data.parking = sports.parking;
        if (!data.restDate) data.restDate = sports.restDate;
        if (!data.openPeriod) data.openPeriod = sports.openPeriod;
        if (!data.homepage) data.homepage = sports.homepage;
        data.modifiedTime = "지금22"
        // if (!data.createdTime) data.createdTime = restaurant.createdTime;

        try {
            transaction = await sequelize.transaction();

            updatedSports = await this.sportsAdminService.update(transaction, sports, data);
            await transaction.commit();

            logger.debug(`Update Restaurant => content_id :  ${searchOptions.contentId}`);
            return updatedSports;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async deleteSports(contentIds: string[]): Promise<void> {
        const allDeleteFiles: string[] = [];
        const albumFolders: string[] = [];
        const sportss: Sports[] = await this.sportsAdminService.selectMul(contentIds);
        if (sportss.length <= 0) throw new NotFoundError("Not found restaurants.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const sports of sportss) {
                await this.sportsAdminService.delete(transaction, sports);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
        }
    }

 }

export default SportsAdminController;
