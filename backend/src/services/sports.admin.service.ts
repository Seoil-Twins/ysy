import { TOURAPI_CODE } from "../constant/statusCode.constant";

import { Op, OrderItem, Transaction, WhereOptions } from "sequelize";
import fetch from "node-fetch";

import { API_ROOT } from "..";

import { Service } from "./service";

import sequelize from "../models";
import { PageOptions, SearchOptions, Sports, IUpdateWithAdmin } from "../models/sports.model";
import { Wanted } from "../models/favorite.model";

import logger from "../logger/logger";

import NotFoundError from "../errors/notFound.error";
import BadRequestError from "../errors/badRequest.error";

const url = process.env.TOURAPI_URL;
const detail_url = process.env.TOURAPI_DETAIL_URL;
const detail_common_url = process.env.TOURAPI_DETAIL_COMMON_URL;
const SERVICEKEY = process.env.TOURAPI_API_KEY;

class SportsAdminService extends Service {
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
    return `${API_ROOT}/admin/sports/search/all?page=1&numOfRows=1&sort=r&contentTypeId=39`;
  }

  async select(sort: string, searchOptions: SearchOptions, transaction: Transaction | null = null): Promise<Sports[]> {
    const resSort: OrderItem = this.createSort(sort);
    const where: WhereOptions = this.createWhere(searchOptions);

    const result: Sports[] | Sports = await Sports.findAll({
      order: [resSort],
      where
    });

    let viewUpdate = {
      view: 0
    };
    for (const sports of result) {
      viewUpdate.view = sports.view + 1;
      let update: Sports = await sports.update(viewUpdate, { transaction });
    }

    return result;
  }

  async selectOne(searchOptions: SearchOptions): Promise<Sports> {
    const where: WhereOptions = this.createWhere(searchOptions);

    const result: Sports | null = await Sports.findOne({
      where
    });

    if (!result) throw new NotFoundError(`Not Exist Sports`);

    return result;
  }
  async selectMul(contentIds: string[]): Promise<Sports[]> {
    // const where: WhereOptions = { contentId: contentIds };
    if (!contentIds) throw new BadRequestError("BadRequest contentIds");

    const sportss: Sports[] = await Sports.findAll({
      where: { contentId: contentIds }
    });

    if (!sportss) throw new NotFoundError(`Not Exist Sports`);

    return sportss;
  }

  async create(transaction: Transaction | null = null, pageOptions: PageOptions, contentTypeId: String | undefined): Promise<Sports[]> {
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
    logger.debug(`Response URL => ${requrl}`);

    try {
      let res = await fetch(requrl);
      const result: any = await Promise.resolve(res.json());

      transaction = await sequelize.transaction();

      let i = 1;
      let resSports: Sports[] = [];
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
        let nowDate = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, "");

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
            homepage: detail_common_result.response.body.items.item[0].homepage,
            openPeriod: detail_result.response.body.items.item[0].openperiod,
            modifiedTime: nowDate,
            createdTime: result.response.body.items.item[k].createdtime
          },
          { transaction }
        );
        i++;
        resSports.push(createdSports);
      }
      transaction.commit();
      return resSports;
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw err;
    }
  }

  async update(transaction: Transaction | null = null, sports: Sports, data: IUpdateWithAdmin): Promise<Sports> {
    const updateSports: Sports = await sports.update(data, { transaction });

    return updateSports;
  }

  async delete(transaction: Transaction | null = null, sports: Sports): Promise<void> {
    await sports.destroy({ transaction });
  }

  async createWanted(transaction: Transaction | null = null, userId: number, contentId: string, contentTypeId: string): Promise<Wanted> {
    try {
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

export default SportsAdminService;
