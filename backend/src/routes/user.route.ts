import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable, { File } from "formidable";
import { boolean } from "boolean";

import { User } from "../models/user.model";
import { CreateUser, UpdateUser, ResponseUser } from "../types/user.type";

import logger from "../logger/logger";
import validator from "../utils/validator.util";
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
  const form = formidable({ maxFileSize: MAX_FILE_SIZE });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

      req.body = Object.assign({}, req.body, fields);

      const { value, error }: ValidationResult = validator(req.body, signupSchema);
      if (error) throw new BadRequestError(error.message);
      else if (Array.isArray(files.profile)) throw new BadRequestError("You must request only one profile");

      const data: CreateUser = {
        snsKind: value.snsKind,
        snsId: value.snsId,
        name: value.name,
        email: value.email,
        birthday: new Date(value.birthday),
        phone: value.phone,
        eventNofi: boolean(value.eventNofi)
      };

      const url: string = await userController.createUser(data, files.profile);

      return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  });
});

// 유저 업데이트
router.patch("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

      req.body = Object.assign({}, req.body, fields);

      const { value, error }: ValidationResult = validator(req.body, updateSchema);

      if (req.params.user_id != req.body.userId) throw new ForbiddenError("You don't same token user ID and path parameter user ID.");
      else if (error) throw new BadRequestError(error.message);
      else if (!value.name && !value.phone && !files.profile && !req.body.profile) throw new BadRequestError("You have to give more than one piece of data.");
      else if (Array.isArray(files.profile)) throw new BadRequestError("You must request only one profile.");

      const data: UpdateUser = {
        name: value.name,
        phone: value.phone
      };

      let file: File | null | undefined = undefined;

      if (files.profile) {
        file = files.profile;
      } else if (!files.profile && (req.body.profile === "null" || req.body.profile === null)) {
        file = null;
      }

      const user: User = await userController.updateUser(req.body.userId, data, file);

      return res.status(STATUS_CODE.OK).json(user);
    } catch (error) {
      next(error);
    }
  });
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
