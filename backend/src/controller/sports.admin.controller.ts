import dayjs from "dayjs";
import randomString from "randomstring";
import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";

import logger from "../logger/logger";

import sequelize from "../model";
import { Sports, ISportsResponseWithCount, PageOptions, SearchOptions } from "../model/sports.model";

import NotFoundError from "../error/notFound";
import ConflictError from "../error/conflict";
import { response } from "express";
import { Json } from "sequelize/types/utils";

import fetch from "node-fetch";
import { URLSearchParams } from "url";

const FOLDER_NAME = "sports";
const url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1";
const detail_url = "http://apis.data.go.kr/B551011/KorService1/detailIntro1";
const detail_common_url = "http://apis.data.go.kr/B551011/KorService1/detailCommon1";
const SERVICEKEY = new String(process.env.TOURAPI_API_KEY);
const controller = {
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
    getSportsFromAPI: async (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> => {
        const offset = (pageOptions.page - 1) * pageOptions.numOfRows;

        const params = {
            numOfRows: pageOptions.numOfRows.toString(),
            pageNo: pageOptions.page.toString(),
            MobileOS: "ETC",
            MobileApp: "AppTest",
            ServiceKey: "+/HZpVR9TlY0YX1X6CbhFyyqCZDcTeqgCkaI87QvifdyB9PPg7LyFH46lWA5kG1u46bLFamCuKz3UyAONBiEOQ==",
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
            const result = await Promise.resolve(res.json());
            console.log(result.response.body.items.item[0].contentid);
            for (let key in result.response.body.items.item[0]) {
                console.log(key + " : " + result.response.body.items.item[0][key]);
            }

            return result;
        } catch (err) {
            console.log("error: ", err);
        }
    },

    /**
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    createSportsDB: async (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> => {
        const offset = (pageOptions.page - 1) * pageOptions.numOfRows;

        const params = {
            numOfRows: pageOptions.numOfRows.toString(),
            pageNo: pageOptions.page.toString(),
            MobileOS: "ETC",
            MobileApp: "AppTest",
            ServiceKey: "+/HZpVR9TlY0YX1X6CbhFyyqCZDcTeqgCkaI87QvifdyB9PPg7LyFH46lWA5kG1u46bLFamCuKz3UyAONBiEOQ==",
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

        let transaction: Transaction | undefined = undefined;

        try {
            let res = await fetch(requrl);
            const result = await Promise.resolve(res.json());

            transaction = await sequelize.transaction();

            let i = 1;
            for (let k = 0; k < result.response.body.items.item.length; ++k) {
                // ?ServiceKey=인증키&contentTypeId=39&contentId=2869760&MobileOS=ETC&MobileApp=AppTest
                const detail_params = {
                    ServiceKey: "+/HZpVR9TlY0YX1X6CbhFyyqCZDcTeqgCkaI87QvifdyB9PPg7LyFH46lWA5kG1u46bLFamCuKz3UyAONBiEOQ==",
                    _type: "json",
                    MobileOS: "ETC",
                    MobileApp: "AppTest",
                    contentTypeId: result.response.body.items.item[k].contenttypeid,
                    contentId: result.response.body.items.item[k].contentid
                };
                const detail_queryString = new URLSearchParams(detail_params).toString();
                const detail_requrl = `${detail_url}?${detail_queryString}`;
                let detail_res = await fetch(detail_requrl);
                const detail_result = await Promise.resolve(detail_res.json());

                // ?ServiceKey=인증키&contentTypeId=39&contentId=2869760&MobileOS=ETC&MobileApp=AppTest&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y
                const detail_common_params = {
                    ServiceKey: "+/HZpVR9TlY0YX1X6CbhFyyqCZDcTeqgCkaI87QvifdyB9PPg7LyFH46lWA5kG1u46bLFamCuKz3UyAONBiEOQ==",
                    _type: "json",
                    MobileOS: "ETC",
                    MobileApp: "AppTest",
                    contentTypeId: result.response.body.items.item[k].contenttypeid,
                    contentId: result.response.body.items.item[k].contentid,
                    defaultYN: "Y",
                    firstImageYN: "Y",
                    areacodeYN: "Y",
                    catcodeYN: "Y",
                    addrinfoYN: "Y",
                    mapinfoYN: "Y",
                    overviewYN: "Y"
                };
                const detail_common_queryString = new URLSearchParams(detail_common_params).toString();
                const detail_common_requrl = `${detail_common_url}?${detail_common_queryString}`;
                let detail_common_res = await fetch(detail_common_requrl);
                const detail_common_result = await Promise.resolve(detail_common_res.json());
                //console.log(detail_result.response.body.items.item[0].firstmenu);
                const createdSports: Sports = await Sports.create(
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
                        babyCarriage: detail_result.response.body.items.item[0].chkbabycarriageleports,
                        phoneNumber: result.response.body.items.item[k].tel,
                        pet: detail_result.response.body.items.item[0].chkpetleports,
                        useTime: detail_result.response.body.items.item[0].usetimeleports,
                        useFee: detail_result.response.body.items.item[0].usefeeleports,
                        parking: detail_result.response.body.items.item[0].parkingleports,
                        restDate: detail_result.response.body.items.item[0].restdateleports,
                        homepage: detail_common_result.response.body.items.item[0].homepage
                    },
                    { transaction }
                );
                i++;
            }
            transaction.commit();
        } catch (err) {
            console.log("error: ", err);

            if (transaction) await transaction.rollback();
            throw err;
        }
    }
};

export default controller;
