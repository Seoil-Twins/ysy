import dayjs from "dayjs";
import express, { Router, Request, Response, NextFunction } from "express";

import { IRestaurantResponseWithCount, PageOptions as ResPageOptions, SearchOptions as ResSearchOptions } from "../model/restaurant.model";

import RestaurantAdminController from "../controller/restaurant.admin.controller";

import logger from "../logger/logger";
import { STATUS_CODE } from "../constant/statusCode.constant";
import { canView } from "../util/checkRole.util";
import RestaurantAdminService from "../service/restaurant.admin.service";

dayjs.locale("ko");

const router: Router = express.Router();
const restaurantAdminService: RestaurantAdminService = new RestaurantAdminService();
const restaurantAdminController:RestaurantAdminController = new RestaurantAdminController(restaurantAdminService);

// let url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=";

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: ""
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
        page: Number(req.query.page) || 1,
        sort: ""
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

router.get("/search/all", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.numOfRows) || 10,
        page: Number(req.query.page) || 1,
        sort: "r"
    };
    const searchOptions: ResSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined,
        contentId: String(req.query.contentId) || undefined,
        title: String(req.query.title) || undefined
    };
    try {
        const result: IRestaurantResponseWithCount = await restaurantAdminController.getAllRestaurant(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/search/title", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: ResPageOptions = {
        numOfRows: Number(req.query.numOfRows) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "ta",
    };
    const searchOptions: ResSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined,
        contentId: String(req.query.contentId) || undefined,
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
        page: Number(req.query.page) || 1,
        sort: ""
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
