import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import { boolean } from "boolean";

import UserService from "../services/user.service.js";
import CoupleService from "../services/couple.service.js";
import CoupleAdminService from "../services/couple.admin.service.js";
import CoupleAdminController from "../controllers/couple.admin.controller.js";

import { Couple } from "../models/couple.model.js";

import {
  ResponseCouplesWithAdmin,
  SearchOptions,
  FilterOptions,
  UpdateCoupleWithAdmin,
  SortItem,
  isSortItem,
  PageOptions,
  CreateCoupleWithAdmin
} from "../types/couple.type.js";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { File } from "../utils/gcp.util.js";
import { ContentType, convertBoolean } from "../utils/router.util.js";
import { canModifyWithEditor, canView } from "../utils/checkRole.util.js";
import { CreatePageOption, createPageOptions } from "../utils/pagination.util.js";
import { MulterUpdateFile, MulterUploadFile, multerUpload, updateFileFunc, uploadFileFunc } from "../utils/multer.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import BadRequestError from "../errors/badRequest.error.js";

const router: Router = express.Router();
const userService: UserService = new UserService();
const coupleService: CoupleService = new CoupleService();
const coupleAdminService: CoupleAdminService = new CoupleAdminService();
const coupleAdminController: CoupleAdminController = new CoupleAdminController(userService, coupleService, coupleAdminService);

const createSchema: joi.Schema = joi.object({
  code: joi.string().length(6).required(),
  otherCode: joi.string().length(6).required(),
  cupDay: joi.date().required(),
  deleted: joi.boolean()
});

const updateSchema: joi.Schema = joi.object({
  cupDay: joi.date().required(),
  deleted: joi.boolean()
});

const fileParamName = "thumbnail";
const upload = multerUpload.single(fileParamName);

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
  const createdPageOptions: CreatePageOption<SortItem> = {
    count: Number(req.query.count),
    page: Number(req.query.page),
    sort: String(req.query.sort),
    defaultValue: "r",
    isSortItem: isSortItem
  };
  const pageOptions: PageOptions<SortItem> = createPageOptions<SortItem>(createdPageOptions);
  const searchOptions: SearchOptions = {
    cupId: String(req.query.cup_id) || undefined
  };
  const filterOptions: FilterOptions = {
    fromDate: req.query.from_date ? new Date(dayjs(String(req.query.from_date)).valueOf()) : undefined,
    toDate: req.query.to_date ? new Date(dayjs(String(req.query.to_date)).add(1, "day").valueOf()) : undefined,
    isDeleted: boolean(req.query.deleted) || false,
    isThumbnail: boolean(req.query.thumbnail) || false
  };

  try {
    const result: ResponseCouplesWithAdmin = await coupleAdminController.getCouples(pageOptions, searchOptions, filterOptions);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;

  const createFunc = async (thumbnail: File) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, createSchema);
      if (error) throw new BadRequestError(error.message);

      const data: CreateCoupleWithAdmin = {
        code: value.code,
        otherCode: value.otherCode,
        cupDay: value.cupDay,
        deleted: convertBoolean(value.deleted)
      };

      const url: string = await coupleAdminController.createCouple(data, thumbnail);
      return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  };

  upload(req, res, (err) => {
    const info: MulterUploadFile = {
      contentType,
      req,
      err,
      next
    };

    uploadFileFunc(info, createFunc);
  });
});

router.patch("/:cup_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const cupId: string = String(req.params.cup_id);
  const contentType: ContentType = req.contentType;

  const updateFunc = async (thumbnail?: File | null) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, updateSchema);
      if (error) throw new BadRequestError(error.message);

      const data: UpdateCoupleWithAdmin = {
        cupDay: value.cupDay,
        deleted: convertBoolean(value.deleted)
      };

      const updatedCouple: Couple = await coupleAdminController.updateCouple(cupId, data, thumbnail);
      return res.status(STATUS_CODE.OK).json(updatedCouple);
    } catch (error) {
      next(error);
    }
  };

  upload(req, res, (err) => {
    const info: MulterUpdateFile = {
      contentType,
      fieldname: fileParamName,
      err,
      next,
      req
    };

    updateFileFunc(info, updateFunc);
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
