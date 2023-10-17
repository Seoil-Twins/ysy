import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import { Couple } from "../models/couple.model.js";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { ContentType } from "../utils/router.util.js";
import { MulterUpdateFile, MulterUploadFile, multerUpload, updateFileFunc, uploadFileFunc } from "../utils/multer.js";
import { File } from "../utils/gcp.util.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import ForbiddenError from "../errors/forbidden.error.js";
import BadRequestError from "../errors/badRequest.error.js";
import UnauthorizedError from "../errors/unauthorized.error.js";

import { ResponseToken } from "../types/auth.type.js";
import { CreateCouple, UpdateCouple } from "../types/couple.type.js";

import CoupleController from "../controllers/couple.controller.js";
import CoupleService from "../services/couple.service.js";
import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";

const router: Router = express.Router();
const coupleSerivce = new CoupleService();
const userService = new UserService();
const userRoleService = new UserRoleService();
const coupleController = new CoupleController(coupleSerivce, userService, userRoleService);

const createSchema: joi.Schema = joi.object({
  otherCode: joi.string().length(6).required(),
  cupDay: joi.date().required()
});

const updateSchema: joi.Schema = joi.object({
  cupDay: joi.date()
});

const fileParamName = "thumbnail";
const upload = multerUpload.single(fileParamName);

// 커플 정보 가져오기
router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cupId: string | null = req.cupId;
    console.log(req.cupId);
    console.log(req.params.cup_id);

    if (!cupId) throw new ForbiddenError("You must request couple ID");
    else if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

    const result: Couple = await coupleController.getCouple(cupId);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

// 커플 생성
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType | undefined = req.contentType;

  const createFunc = async (thumbnail?: File) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, createSchema);
      if (error) throw new BadRequestError(error.message);

      const data: CreateCouple = {
        otherCode: value.otherCode,
        cupDay: value.cupDay
      };

      const [result, url]: [ResponseToken, string] = await coupleController.createCouple(req.userId!, data, thumbnail);

      logger.debug(`Response Data : ${JSON.stringify(data)}`);
      return res.header({ Location: url }).status(STATUS_CODE.CREATED).json(result);
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

// 커플 정보 수정
router.patch("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  console.log("asdasdsa");
  const contentType: ContentType = req.contentType;
  console.log("file :: " + req.file);
  console.log("files :: " + req.files);
  console.log("body :: " + req.body);

  const updateFunc = async (thumbnail?: File | null) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, updateSchema);
      if (error) throw new BadRequestError(error.message);
      else if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

      const data: UpdateCouple = {
        cupDay: value.cupDay
      };

      const couple: Couple = await coupleController.updateCouple(req.userId!, req.cupId, data, thumbnail);
      return res.status(STATUS_CODE.OK).json(couple);
    } catch (error) {
      next(error);
    }
  };

  upload(req, res, (err) => {
    const info: MulterUpdateFile = {
      contentType,
      req,
      err,
      fieldname: fileParamName,
      next
    };

    updateFileFunc(info, updateFunc);
  });
});

// 커플 끊기
router.delete("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cupId = req.cupId;

    if (!cupId) throw new UnauthorizedError("Invalid Token");
    else if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

    const result: ResponseToken = await coupleController.deleteCouple(req.userId!, req.roleId!, cupId);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
