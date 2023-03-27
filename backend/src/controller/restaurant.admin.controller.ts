import { Op, Transaction } from "sequelize";

import sequelize from "../model";
import { Restaurant, PageOptions, SearchOptions } from "../model/restaurant.model";

import fetch from "node-fetch";
import { URLSearchParams } from "url";
import BadRequestError from "../error/badRequest.error";

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
    getRestaurantFromAPI: async (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> => {
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
    },

    /**
     * @param pageOptions A {@link PageOptions}
     * @param searchOptions A {@link SearchOptions}
     * @returns A {@link IUserResponseWithCount}
     */
    createRestaurantDB: async (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> => {
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
            const result: any = await Promise.resolve(res.json());
            // console.log(result.response.body.items.item[0]);
            // console.log(result.response.body.items.item.length);
            // for (let key in result.response.body.items.item[0]) {
            //     console.log(key + " : " + result.response.body.items.item[0][key]);
            // }

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
                const detail_result: any = await Promise.resolve(detail_res.json());

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
                const detail_common_result: any = await Promise.resolve(detail_common_res.json());
                //console.log(detail_result.response.body.items.item[0].firstmenu);
                const createdRestaraunt: Restaurant = await Restaurant.create(
                    {
                        //restaurantId: result.response.body.items.item[0]
                        //restaurantId: result.response.body.items.item.length
                        //restaurantId: result.response.body.items.item[0]
                        // restaurantId: i,
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
                        signatureDish: detail_result.response.body.items.item[0].firstmenu,
                        phoneNumber: result.response.body.items.item[k].tel,
                        kidsFacility: detail_result.response.body.items.item[0].kidsfacility,
                        useTime: detail_result.response.body.items.item[0].opentimefood,
                        parking: detail_result.response.body.items.item[0].parkingfood,
                        restDate: detail_result.response.body.items.item[0].restdatefood,
                        smoking: detail_result.response.body.items.item[0].smoking,
                        reservation: detail_result.response.body.items.item[0].reservationfood,
                        homepage: "주소"
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
    },

    getRestaurantWithTitle: async (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> => {
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
    },
    getRestaurantWithContentId: async (pageOptions: PageOptions, searchOptions: SearchOptions): Promise<any> => {
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
};

export default controller;
