import { STATUS_CODE } from "../constants/statusCode.constant";

import dayjs from "dayjs";
import express, { Router, Request, Response, NextFunction } from "express";
import { Transaction } from "sequelize";

import {
  ITouristSpotResponseWithCount,
  IUpdateWithAdmin,
  PageOptions as TSPageOptions,
  SearchOptions as TSSearchOptions,
  TouristSpot
} from "../models/touristSpot.model";
import { Wanted } from "../models/favorite.model";

import logger from "../logger/logger";
import { canView } from "../utils/checkRole.util";

import TouristSpotAdminService from "../services/touristSpot.admin.service";
import TouristSpotAdminController from "../controller/touristSpot.admin.controller";

import BadRequestError from "../errors/badRequest.error";

dayjs.locale("ko");

const router: Router = express.Router();
const touristSpotAdminService: TouristSpotAdminService = new TouristSpotAdminService();
const touristSpotAdminController: TouristSpotAdminController = new TouristSpotAdminController(touristSpotAdminService);

// let url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=";
router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
  const pageOptions: TSPageOptions = {
    numOfRows: Number(req.query.numOfRows) || 10,
    page: Number(req.query.page) || 1,
    sort: String(req.query.sort) || "r"
  };
  const searchOptions: TSSearchOptions = {
    contentTypeId: String(req.query.contentTypeId) || undefined
  };
  try {
    const result: ITouristSpotResponseWithCount = await touristSpotAdminController.getTouristSpotFromAPI(pageOptions, searchOptions);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/create", canView, async (req: Request, res: Response, next: NextFunction) => {
  const pageOptions: TSPageOptions = {
    numOfRows: Number(req.query.numOfRows) || 10,
    page: Number(req.query.page) || 1,
    sort: String(req.query.sort) || "r"
  };
  const contentTypeId: String | undefined = req.query.contentTypeId ? String(req.query.contentTypeId) : undefined;

  try {
    const result: TouristSpot[] = await touristSpotAdminController.createTouristSpotDB(pageOptions, contentTypeId);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/search/all", canView, async (req: Request, res: Response, next: NextFunction) => {
  const sort = String(req.query.sort);
  const searchOptions: TSSearchOptions = {
    contentTypeId: String(req.query.contentTypeId) || undefined,
    contentId: String(req.query.contentId) || undefined,
    title: String(req.query.title) || undefined
  };
  try {
    const result: TouristSpot[] = await touristSpotAdminController.getAllTouristSpot(sort, searchOptions);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/update/:content_id", canView, async (req: Request, res: Response, next: NextFunction) => {
  const contentId: string = req.params.content_id;

  const data: IUpdateWithAdmin = {
    areaCode: req.query.areaCode ? String(req.query.areaCode) : undefined,
    sigunguCode: req.query.sigunguCode ? String(req.query.sigunguCode) : undefined,
    view: req.query.view ? Number(req.query.view) : undefined,
    title: req.query.title ? String(req.query.title) : undefined,
    address: req.query.address ? String(req.query.address) : undefined,
    mapX: req.query.mapX ? String(req.query.mapX) : undefined,
    mapY: req.query.mapY ? String(req.query.mapY) : undefined,

    description: req.query.description ? String(req.query.description) : undefined,
    thumbnail: req.query.thumbnail ? String(req.query.thumbnail) : undefined,
    pet: req.query.pet ? String(req.query.pet) : undefined,
    phoneNumber: req.query.phoneNumber ? String(req.query.phoneNumber) : undefined,
    babyCarriage: req.query.kidsFacility ? String(req.query.kidsFacility) : undefined,
    useTime: req.query.useTime ? String(req.query.useTime) : undefined,
    parking: req.query.parking ? String(req.query.parking) : undefined,
    restDate: req.query.restDate ? String(req.query.restDate) : undefined,
    expguide: req.query.expguide ? String(req.query.expguide) : undefined,
    homepage: req.query.homepage ? String(req.query.homepage) : undefined,
    modifiedTime: String("20230417")
  };

  try {
    if (!contentId || contentId.length <= 0) throw new BadRequestError("content ID error");

    const touristSpot: TouristSpot = await touristSpotAdminController.updateTouristSpot(contentId, data);

    return res.status(STATUS_CODE.OK).json(touristSpot);
  } catch (error) {
    next(error);
  }
});

router.delete("/:content_ids", canView, async (req: Request, res: Response, next: NextFunction) => {
  const contentIds: string[] = req.params.content_ids.split(",").map(String);

  try {
    if (!contentIds || contentIds.length <= 0) throw new BadRequestError("content ID must be a string type");

    await touristSpotAdminController.deleteTouristSpot(contentIds);
    return res.status(STATUS_CODE.OK).json({});
  } catch (error) {
    next(error);
  }
});

router.post("/wanted", canView, async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = Number(req.body.userId);
  const contentId: string = String(req.query.content_id);

  try {
    const result: Wanted = await touristSpotAdminController.createWantedTouristSpot(contentId, userId);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});
export default router;
