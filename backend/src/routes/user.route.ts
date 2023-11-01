import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import { boolean } from "boolean";

import { User } from "../models/user.model.js";
import { CreateUser, UpdateUser, ResponseUser, UpdateUserNotification } from "../types/user.type.js";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { ContentType } from "../utils/router.util.js";
import { MulterUpdateFile, MulterUploadFile, multerUpload, updateFileFunc, uploadFileFunc } from "../utils/multer.js";
import { File } from "../utils/gcp.util.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import BadRequestError from "../errors/badRequest.error.js";
import ForbiddenError from "../errors/forbidden.error.js";

import UserController from "../controllers/user.controller.js";
import UserService from "../services/user.service.js";
import UserRoleService from "../services/userRole.service.js";

const router: Router = express.Router();
const userService = new UserService();
const userRoleService = new UserRoleService();
const userController = new UserController(userService, userRoleService);

const phonePattern = /^[0-9]+$/;
const signupSchema: joi.Schema = joi.object({
  snsId: joi.string().required(),
  snsKind: joi.string().length(4).required(),
  name: joi.string().max(10).trim().required(),
  email: joi.string().trim().email().required(),
  phone: joi.string().trim().length(11).regex(RegExp(phonePattern)).required(),
  birthday: joi
    .date()
    .greater(new Date("1970-01-01")) // 1970-01-01보다 더 큰 날짜여야 함.
    .less(new Date("2023-12-31")) // 2023-12-31보다 낮은 날짜여야 함.
    .required(),
  eventNofi: joi.bool().default(false)
});

const updateSchema: joi.Schema = joi.object({
  name: joi.string().min(2).max(8).trim()
});

const updateNofiSchema: joi.Schema = joi.object({
  primaryNofi: joi.boolean(),
  dateNofi: joi.boolean(),
  eventNofi: joi.boolean(),
  coupleNofi: joi.boolean(),
  albumNofi: joi.boolean(),
  calendarNofi: joi.boolean()
});

const fileParamName = "profile";
const upload = multerUpload.single(fileParamName);

// 내 정보 가져오기
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result: ResponseUser = await userController.getUser(req.userId!);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

// 유저 생성
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType | undefined = req.contentType;

  const createFunc = async (profile?: File | string) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, signupSchema);

      if (error) throw new BadRequestError(error.message);

      const data: CreateUser = {
        snsKind: value.snsKind,
        snsId: value.snsId,
        name: value.name,
        email: value.email,
        birthday: new Date(value.birthday),
        phone: value.phone,
        eventNofi: boolean(value.eventNofi)
      };

      if (req.body.profile) {
        profile = req.body.profile;
      }

      await userController.createUser(data, profile);

      logger.debug(`Response Data : ${JSON.stringify(data)}`);
      return res.status(STATUS_CODE.CREATED).json({});
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

// 유저 수정
router.patch("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType | undefined = req.contentType;

  const updateFunc = async (profile?: File | null) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, updateSchema);

      if (req.userId && Number(req.params.user_id) != req.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID.");
      else if (error) throw new BadRequestError(error.message);

      const data: UpdateUser = {
        name: value.name,
        phone: value.phone
      };

      const user: User = await userController.updateUser(req.userId!, data, profile);
      return res.status(STATUS_CODE.OK).json(user);
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

// 유저 알림 수정
router.patch("/nofi/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error }: ValidationResult = validator(req.body, updateNofiSchema);
    if (error) throw new BadRequestError(error.message);

    const data: UpdateUserNotification = {
      primaryNofi: value.primaryNofi,
      dateNofi: value.dateNofi,
      eventNofi: value.eventNofi,
      coupleNofi: value.coupleNofi,
      albumNofi: value.albumNofi,
      calendarNofi: value.calendarNofi
    };

    const updatedUser: User = await userController.updateUserNotification(req.userId!, data);
    return res.status(STATUS_CODE.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// 유저 삭제
router.delete("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Couple 정보를 삭제 후 요청
    if (req.cupId) throw new BadRequestError("You must first delete couple.");
    else if (Number(req.params.user_id) != req.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID");

    await userController.deleteUser(req.userId!);

    return res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
