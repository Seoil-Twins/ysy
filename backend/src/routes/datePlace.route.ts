import express, { Router, Request, Response, NextFunction } from "express";

import logger from "../logger/logger.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import { FilterOptions, PageOptions, ResponseDatePlace, ResponseItem, SearchOptions, SortItem, isSortItem } from "../types/datePlace.type.js";

import DatePlaceService from "../services/datePlace.service.js";
import ContentTypeService from "../services/contentType.service.js";
import DatePlaceImageService from "../services/datePlaceImage.service.js";
import DatePlaceController from "../controllers/datePlace.controller.js";

import BadRequestError from "../errors/badRequest.error.js";

const router: Router = express.Router();
const DEFAULT_COUNT = 20;

const contentTypeSerivce: ContentTypeService = new ContentTypeService();
const datePlaceService: DatePlaceService = new DatePlaceService();
const datePlaceImageService: DatePlaceImageService = new DatePlaceImageService();
const datePlaceController: DatePlaceController = new DatePlaceController(contentTypeSerivce, datePlaceService, datePlaceImageService);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
  const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : DEFAULT_COUNT;
  const sort: SortItem = isSortItem(req.query.sort) ? req.query.sort : "r";
  const areaCode: string | undefined = req.query.areaCode ? String(req.query.areaCode) : undefined;
  const sigunguCode: string | undefined = req.query.sigunguCode ? String(req.query.sigunguCode) : undefined;
  const kind: string | undefined = req.query.kind ? String(req.query.kind) : undefined;

  try {
    if (!areaCode && sigunguCode) throw new BadRequestError("If you want to request 'sigunguCode', you need to request an 'areaCode'");
    else if (!areaCode) throw new BadRequestError("You must request parameter 'areaCode'");

    const pageOptions: PageOptions = { page, count, sort };
    const searchOptions: SearchOptions = { areaCode, sigunguCode };
    const filterOptions: FilterOptions = { kind };
    const results: ResponseDatePlace = await datePlaceController.getDatePlaces(req.userId!, pageOptions, searchOptions, filterOptions);

    logger.debug(`Response Data : ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req: Request, res: Response, next: NextFunction) => {
  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
  const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : DEFAULT_COUNT;
  const sort: SortItem = "f";
  const keyword: string | undefined = req.query.keyword ? String(req.query.keyword) : undefined;

  try {
    if (!keyword) throw new BadRequestError("You must request parameter 'keyword'");

    const pageOptions: PageOptions = { page, count, sort };
    const results: ResponseDatePlace = await datePlaceController.getDatePlacesWithKeyword(req.userId!, keyword, pageOptions);

    logger.debug(`Response Data : ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.get("/:content_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentId: string | undefined = req.params.content_id;

  try {
    if (!contentId) throw new BadRequestError("'content_id' is require parameter.");

    const results: ResponseItem = await datePlaceController.getDatePlace(req.userId!, contentId);

    logger.debug(`Response Data : ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
