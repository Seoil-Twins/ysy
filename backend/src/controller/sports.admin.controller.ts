import fetch from "node-fetch";
import { URLSearchParams } from "url";

import { Transaction } from "sequelize";

import { TOURAPI_CODE } from "../constant/statusCode.constant";

import sequelize from "../model";
import { Sports, PageOptions, SearchOptions, IUpdateWithAdmin } from "../model/sports.model";

import SportsAdminService from "../service/sports.admin.service";

import BadRequestError from "../error/badRequest.error";
import NotFoundError from "../error/notFound.error";

import logger from "../logger/logger";
import { Wanted } from "../model/wanted.model";

const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
class SportsAdminController {
    
    private sportsAdminService: SportsAdminService;
    private CONTENT_TYPE_ID: string = "28";

    constructor(sportsAdminService: SportsAdminService) {
        this.sportsAdminService = sportsAdminService;
    }

    async getSportsFromAPI(pageOptions: PageOptions, contentTypeId: String | undefined): Promise<any> {

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
            logger.debug(`Error Sports  :  ${err}`);
            throw err;
        }
    }

    async createSportsDB (pageOptions: PageOptions, contentTypeId: String | undefined): Promise<Sports[]> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Sports[] = await this.sportsAdminService.create(transaction, pageOptions, contentTypeId);

            await transaction.commit();
            logger.debug(`Created Sports => ${JSON.stringify(result)}`);

            // const url: string = this.sportsAdminService.getURL();
            return result
        } catch (err) {
            logger.debug(`Error Sports  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

    async getAllSports(sort: string, searchOptions: SearchOptions): Promise<any> {
        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();
            const result: Sports | Sports[] = await this.sportsAdminService.select(sort, searchOptions,transaction);
            await transaction.commit();

            return result;
        } catch (err) {
            if (transaction) await transaction.rollback();
            logger.debug(`Error Sports  :  ${err}`);
            throw err;
        }
    }

    async updateSports(searchOptions: SearchOptions, data: IUpdateWithAdmin): Promise<Sports> {
        let updatedSports: Sports | null = null;
        const sports: Sports | null = await this.sportsAdminService.selectOne(searchOptions);
        let nowDate = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');

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
        data.modifiedTime = nowDate;

        try {
            transaction = await sequelize.transaction();

            updatedSports = await this.sportsAdminService.update(transaction, sports, data);
            await transaction.commit();

            logger.debug(`Update Sports => content_id :  ${searchOptions.contentId}`);
            return updatedSports;
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async deleteSports(contentIds: string[]): Promise<void> {
        const sportss: Sports[] = await this.sportsAdminService.selectMul(contentIds);
        if (sportss.length <= 0) throw new NotFoundError("Not found sports.");

        let transaction: Transaction | undefined = undefined;

        try {
            transaction = await sequelize.transaction();

            for (const sports of sportss) {
                await this.sportsAdminService.delete(transaction, sports);
            }

            await transaction.commit();
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    async createWantedSports(contentId: string, userId: number): Promise<Wanted> {
        let transaction: Transaction | undefined = undefined;
        try {
            transaction = await sequelize.transaction();

            const result: Wanted = await this.sportsAdminService.createWanted(transaction, userId, contentId, this.CONTENT_TYPE_ID);

            await transaction.commit();
            logger.debug(`Created Sports => ${JSON.stringify(result)}`);

            return result;

        } catch (err) {
            logger.debug(`Error Sports  :  ${err}`);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }

 }

export default SportsAdminController;
