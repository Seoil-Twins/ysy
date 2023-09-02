import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable, { File } from "formidable";
import { boolean } from "boolean";

import { User } from "../models/user.model";
import { CreateUser, UpdateUser, ResponseUser, UpdateUserNotification } from "../types/user.type";

import logger from "../logger/logger";
import validator from "../utils/validator.util";
import { ContentType } from "../utils/router.util";

import { STATUS_CODE } from "../constants/statusCode.constant";
import { MAX_FILE_SIZE } from "../constants/file.constant";

import BadRequestError from "../errors/badRequest.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalServerError from "../errors/internalServer.error";

import UserController from "../controller/user.controller";
import UserService from "../services/user.service";
import UserRoleService from "../services/userRole.service";

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
  userId: joi.number().required(),
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

// 내 정보 가져오기
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = Number(req.body.userId);

  try {
    if (isNaN(userId)) throw new BadRequestError("User ID must be a number type or number string");
    const result: ResponseUser = await userController.getUser(userId);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

// 유저 생성
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.body.contentType;
  const form = formidable({ maxFileSize: MAX_FILE_SIZE });

  const createFunc = async (req: Request, profile?: File) => {
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

      const url: string = await userController.createUser(data, profile);
      return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  };

  if (contentType === "form-data") {
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
        else if (Array.isArray(files.profile)) throw new BadRequestError("You must request only one profile");

        req.body = Object.assign({}, req.body, fields);

        createFunc(req, files.profile);
      } catch (error) {
        next(error);
      }
    });
  } else if (contentType === "json") {
    createFunc(req, undefined);
  }
});

// 유저 수정
router.patch("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.body.contentType;
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });

  const updateFunc = async (req: Request, profile?: formidable.File | null) => {
    const { value, error }: ValidationResult = validator(req.body, updateSchema);

    if (req.params.user_id != req.body.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID.");
    else if (error) throw new BadRequestError(error.message);

    const data: UpdateUser = {
      name: value.name,
      phone: value.phone
    };

    const user: User = await userController.updateUser(req.body.userId, data, profile);
    return res.status(STATUS_CODE.OK).json(user);
  };

  if (contentType === "form-data") {
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
        else if (!files.profile || Array.isArray(files.profile)) throw new BadRequestError("You must request only one profile.");

        req.body = Object.assign({}, req.body, fields);

        updateFunc(req, files.profile);
      } catch (error) {
        next(error);
      }
    });
  } else if (contentType === "json") {
    let profile: null | undefined = undefined;

    if (req.body.profile === "null" || req.body.profile === null) {
      profile = null;
    }

    updateFunc(req, profile);
  }
});

// 유저 알림 수정
router.patch("/nofi/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = Number(req.body.userId);

  try {
    if (isNaN(userId)) throw new BadRequestError("User ID must be a number type or number string");

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

    const updatedUser: User = await userController.updateUserNotification(userId, data);
    return res.status(STATUS_CODE.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// 유저 삭제
router.delete("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = Number(req.body.userId);

  try {
    // Couple 정보를 삭제 후 요청
    if (req.body.cupId) throw new BadRequestError("You must first delete couple.");
    else if (req.params.user_id != req.body.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID");
    else if (isNaN(userId)) throw new BadRequestError(`User ID must be a number type or number string`);

    await userController.deleteUser(userId);

    return res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
