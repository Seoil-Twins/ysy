import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable, { File } from "formidable";
import { boolean } from "boolean";

import { IAlbumResponseWithCount, PageOptions, SearchOptions, FilterOptions, IRequestGet, IUpdate } from "../model/album.model";

import coupleController from "../controller/couple.controller";
import albumAdminController from "../controller/album.admin.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";
import { canModifyWithEditor, canView } from "../util/checkRole";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";

const router: Router = express.Router();

const signupSchema: joi.Schema = joi.object({
    userId2: joi.number().required(),
    title: joi.string().required(),
    cupDay: joi.date().required()
});

const updateSchema: joi.Schema = joi.object({
    title: joi.string(),
    cupDay: joi.date()
});

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: PageOptions = {
        count: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "r"
    };
    const searchOptions: SearchOptions = {
        cupId: req.query.cup_id ? String(req.query.cup_id) : undefined
    };
    const filterOptions: FilterOptions = {
        fromDate: req.query.from_date ? new Date(dayjs(String(req.query.from_date)).valueOf()) : undefined,
        toDate: req.query.to_date ? new Date(dayjs(String(req.query.to_date)).add(1, "day").valueOf()) : undefined
    };

    try {
        const result: IAlbumResponseWithCount = await albumAdminController.getAlbumFolders(pageOptions, searchOptions, filterOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

// Create Couple
router.post("/", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {});

router.patch("/:cup_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {});

router.delete("/:couple_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {});

export default router;
