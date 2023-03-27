import dayjs from "dayjs";
import express, { Router, Request, Response, NextFunction } from "express";

import { IRestaurantResponseWithCount, PageOptions as ResPageOptions, SearchOptions as ResSearchOptions } from "../model/restaurant.model";

import restaurantAdminController from "../controller/restaurant.admin.controller";

import logger from "../logger/logger";
import { STATUS_CODE } from "../constant/statusCode.constant";
import { canView } from "../util/checkRole.util";

dayjs.locale("ko");

const router: Router = express.Router();

// let url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=";

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1
    };
    const searchOptions: ResSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined
    };
    try {
        const result: IRestaurantResponseWithCount = await restaurantAdminController.getRestaurantFromAPI(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/create", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.numOfRows) || 10,
        page: Number(req.query.page) || 1
    };
    const searchOptions: ResSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined
    };
    try {
        const result: IRestaurantResponseWithCount = await restaurantAdminController.createRestaurantDB(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/search/title", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.numOfRows) || 10,
        page: Number(req.query.page) || 1
    };
    const searchOptions: ResSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined,
        title: String(req.query.title) || undefined
    };
    try {
        const result: IRestaurantResponseWithCount = await restaurantAdminController.getRestaurantWithTitle(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/search/contentId", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.numOfRows) || 10,
        page: Number(req.query.page) || 1
    };
    const searchOptions: ResSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined,
        contentId: String(req.query.contentId) || undefined
    };
    try {
        const result: IRestaurantResponseWithCount = await restaurantAdminController.getRestaurantWithContentId(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
