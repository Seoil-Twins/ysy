import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable from "formidable";
import { boolean } from "boolean";

import { ISportsResponseWithCount, PageOptions as CulPageOptions, SearchOptions as CulSearchOptions } from "../model/sports.model";

import sportsAdminController from "../controller/sports.admin.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";
import { canModifyWithEditor, canView } from "../util/checkRole";

import BadRequestError from "../error/badRequest";
import InternalServerError from "../error/internalServer";

dayjs.locale("ko");

const router: Router = express.Router();

// let url = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1?numOfRows=";

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: CulPageOptions = {
        numOfRows: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1
    };
    const searchOptions: CulSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined
    };
    try {
        const result: ISportsResponseWithCount = await sportsAdminController.getSportsFromAPI(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/create", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: CulPageOptions = {
        numOfRows: Number(req.query.numOfRows) || 10,
        page: Number(req.query.page) || 1
    };
    const searchOptions: CulSearchOptions = {
        contentTypeId: String(req.query.contentTypeId) || undefined
    };
    try {
        const result: ISportsResponseWithCount = await sportsAdminController.createSportsDB(pageOptions, searchOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
