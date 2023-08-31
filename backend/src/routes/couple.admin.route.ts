import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable, { File } from "formidable";
import { boolean } from "boolean";

import UserService from "../services/user.service";
import CoupleService from "../services/couple.service";
import CoupleAdminService from "../services/couple.admin.service";
import AlbumService from "../services/album.service";

import {
    ICoupleResponseWithCount,
    PageOptions as CouplePageOptions,
    SearchOptions as CoupleSearchOptions,
    FilterOptions as CoupleFilterOptions,
    IRequestCreate,
    IUpdateWithAdmin,
    Couple
} from "../models/couple.model";
import CoupleAdminController from "../controller/couple.admin.controller";

import logger from "../logger/logger";
import validator from "../utils/validator.util";
import { STATUS_CODE } from "../constant/statusCode.constant";
import { canModifyWithEditor, canView } from "../utils/checkRole.util";

import BadRequestError from "../errors/badRequest.error";
import InternalServerError from "../errors/internalServer.error";

const router: Router = express.Router();
const userService: UserService = new UserService();
const coupleService: CoupleService = new CoupleService();
const coupleAdminService: CoupleAdminService = new CoupleAdminService();
const albumService: AlbumService = new AlbumService();
const coupleAdminController: CoupleAdminController = new CoupleAdminController(userService, coupleService, coupleAdminService, albumService);

const signupSchema: joi.Schema = joi.object({
    userId2: joi.number().required(),
    title: joi.string().required(),
    cupDay: joi.date().required()
});

const updateSchema: joi.Schema = joi.object({
    title: joi.string(),
    cupDay: joi.date(),
    deleted: joi.boolean(),
    deletedTime: joi.when("deleted", { is: true, then: joi.required() })
});

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: CouplePageOptions = {
        count: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "r"
    };
    const searchOptions: CoupleSearchOptions = { name: String(req.query.name) || undefined };
    const filterOptions: CoupleFilterOptions = {
        fromDate: req.query.from_date ? new Date(dayjs(String(req.query.from_date)).valueOf()) : undefined,
        toDate: req.query.to_date ? new Date(dayjs(String(req.query.to_date)).add(1, "day").valueOf()) : undefined,
        isDeleted: boolean(req.query.deleted) || false
    };

    try {
        const result: ICoupleResponseWithCount = await coupleAdminController.getCouples(pageOptions, searchOptions, filterOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        next(error);
    }
});

// Create Couple
router.post("/", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, signupSchema);
            const file: File | undefined = !(files.file instanceof Array<formidable.File>) ? files.file : undefined;

            if (error) throw new BadRequestError(error.message);

            const data: IRequestCreate = {
                userId: value.userId1,
                userId2: value.userId2,
                cupDay: value.cupDay,
                title: value.title
            };

            const url: string = await coupleAdminController.createCouple(data, file);
            return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

// Update Couple Info
router.patch("/:cup_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const cupId: string = String(req.params.cup_id);
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, updateSchema);
            const thumbnail: File | undefined = !(files.thumbnail instanceof Array<formidable.File>) ? files.thumbnail : undefined;

            if (error) throw new BadRequestError(error.message);
            else if (!thumbnail && !req.body.title && !req.body.cupDay) throw new BadRequestError("Request values is empty");

            const data: IUpdateWithAdmin = {
                cupDay: value.cupDay,
                title: value.title,
                deleted: value.deleted,
                deletedTime: value.deletedTime
            };

            const updatedCouple: Couple = await coupleAdminController.updateCouple(cupId, data, thumbnail);
            return res.status(STATUS_CODE.OK).json(updatedCouple);
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:couple_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const coupleIds: string[] = req.params.couple_ids.split(",");

    try {
        await coupleAdminController.deleteCouples(coupleIds);
        res.status(STATUS_CODE.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
