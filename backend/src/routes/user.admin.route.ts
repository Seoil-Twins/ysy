import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import { boolean } from "boolean";

import { User } from "../models/user.model.js";
import { SearchOptions, FilterOptions, SortItem, isSortItem, ResponseUsersWithAdmin, UpdateUserWithAdmin, CreateUserWithAdmin } from "../types/user.type.js";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { canModifyWithEditor, canView } from "../utils/checkRole.util.js";
import { convertStringtoDate, CreatePageOption, createPageOptions, PageOptions } from "../utils/pagination.util.js";
import { ContentType, convertBoolean } from "../utils/router.util.js";
import { File } from "../utils/gcp.util.js";
import { MulterUpdateFile, MulterUploadFile, multerUpload, updateFileFunc, uploadFileFunc } from "../utils/multer.js";

import BadRequestError from "../errors/badRequest.error.js";

import UserService from "../services/user.service.js";
import UserAdminService from "../services/user.admin.service.js";
import UserRoleService from "../services/userRole.service.js";
import CoupleAdminService from "../services/couple.admin.service.js";
import AdminService from "../services/admin.service.js";
import UserAdminController from "../controllers/user.admin.controller.js";

const router: Router = express.Router();
const userService: UserService = new UserService();
const userAdminService: UserAdminService = new UserAdminService();
const userRoleService: UserRoleService = new UserRoleService();
const adminService: AdminService = new AdminService();
const coupleAdminService: CoupleAdminService = new CoupleAdminService();
const userAdminController: UserAdminController = new UserAdminController(userService, userAdminService, userRoleService, adminService, coupleAdminService);

const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/;
const phonePattern = /^[0-9]+$/;
const createSchema: joi.Schema = joi.object({
  snsId: joi.string().max(20).required(),
  snsKind: joi.string().length(4).required(),
  code: joi.string().length(6).trim(),
  name: joi.string().max(8).trim().required(),
  email: joi.string().trim().email().required(),
  phone: joi.string().trim().length(11).regex(RegExp(phonePattern)).required(),
  birthday: joi
    .date()
    .greater(new Date("1980-01-01")) // 1980-01-01보다 더 큰 날짜여야 함.
    .less(new Date("2023-12-31"))
    .required(), // 2023-12-31보다 낮은 날짜여야 함.
  primaryNofi: joi.bool().required(),
  eventNofi: joi.bool().required(),
  dateNofi: joi.bool().required(),
  coupleNofi: joi.bool().required(),
  albumNofi: joi.bool().required(),
  calendarNofi: joi.bool().required(),
  role: joi.number().min(1).max(4).required(),
  password: joi.when("role", {
    is: joi.number().valid(1, 2, 3),
    then: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)).required(),
    otherwise: joi.forbidden()
  }),
  deleted: joi.bool()
});

const updateSchema: joi.Schema = joi.object({
  snsId: joi.string().max(20).required(),
  snsKind: joi.string().length(4).required(),
  code: joi.string().length(6).trim(),
  name: joi.string().max(8).trim().required(),
  email: joi.string().trim().email().required(),
  phone: joi.string().trim().length(11).regex(RegExp(phonePattern)).required(),
  birthday: joi
    .date()
    .greater(new Date("1980-01-01")) // 1980-01-01보다 더 큰 날짜여야 함.
    .less(new Date("2023-12-31"))
    .required(), // 2023-12-31보다 낮은 날짜여야 함.
  primaryNofi: joi.bool().default(false).required(),
  eventNofi: joi.bool().default(false).required(),
  dateNofi: joi.bool().default(false).required(),
  coupleNofi: joi.bool().default(false).required(),
  albumNofi: joi.bool().default(false).required(),
  calendarNofi: joi.bool().default(false).required(),
  role: joi.number().min(1).max(4),
  password: joi.when("role", {
    is: joi.number().valid(1, 2, 3),
    then: joi.string().trim().min(8),
    otherwise: joi.forbidden()
  }),
  deleted: joi.bool()
});

const fileParamName = "profile";
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
    name: String(req.query.name) || undefined,
    snsKind: String(req.query.sns_kind) || undefined
  };

  const { fromDate, toDate }: { fromDate?: Date; toDate?: Date } = convertStringtoDate({
    strStartDate: req.query.from_date,
    strEndDate: req.query.to_date
  });
  const filterOptions: FilterOptions = {
    fromDate,
    toDate,
    isProfile: convertBoolean(req.query.profile) || false,
    isCouple: convertBoolean(req.query.couple) || false,
    isDeleted: convertBoolean(req.query.deleted) || false
  };

  try {
    const result: ResponseUsersWithAdmin = await userAdminController.getUsers(pageOptions, searchOptions, filterOptions);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:user_id", canView, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: number = Number(req.params.user_id);
    if (isNaN(userId)) throw new BadRequestError("User Id must be a number type");

    const result: User = await userAdminController.getUser(userId);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;

  const createFunc = async (profile?: File) => {
    try {
      const { value, error }: ValidationResult = validator(req.body, createSchema);

      if (error) throw new BadRequestError(error.message);
      else if (Number(req.roleId) !== 1 && value.role == 1) throw new BadRequestError("Invalida RoleId OR You don't set admin roleId");

      const data: CreateUserWithAdmin = {
        snsId: value.snsId,
        snsKind: value.snsKind,
        code: value.code,
        name: value.name,
        email: value.email,
        phone: value.phone,
        birthday: value.birthday,
        primaryNofi: convertBoolean(value.primaryNofi) || false,
        eventNofi: convertBoolean(value.eventNofi) || false,
        dateNofi: convertBoolean(value.dateNofi) || false,
        coupleNofi: convertBoolean(value.coupleNofi) || false,
        albumNofi: convertBoolean(value.albumNofi) || false,
        calendarNofi: convertBoolean(value.calendarNofi) || false,
        role: value.role,
        password: value.password,
        deleted: convertBoolean(value.deleted) || false
      };

      const url: string = await userAdminController.createUser(data, profile);
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

router.patch("/:user_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;

  const updateFunc = async (profile?: File | null) => {
    try {
      const userId: number = Number(req.params.user_id);
      if (isNaN(userId)) throw new BadRequestError("User Id must be a number type");

      const { value, error }: ValidationResult = validator(req.body, updateSchema);

      if (error) throw new BadRequestError(error.message);
      else if (Number(req.roleId) !== 1 && value.role == 1) throw new BadRequestError("You don't set admin roleId");

      const data: UpdateUserWithAdmin = {
        snsId: value.snsId,
        snsKind: value.snsKind,
        code: value.code,
        name: value.name,
        email: value.email,
        phone: value.phone,
        birthday: value.birthday,
        primaryNofi: convertBoolean(value.primaryNofi),
        eventNofi: convertBoolean(value.eventNofi),
        dateNofi: convertBoolean(value.dateNofi),
        coupleNofi: convertBoolean(value.coupleNofi),
        albumNofi: convertBoolean(value.albumNofi),
        calendarNofi: convertBoolean(value.calendarNofi),
        role: value.role,
        password: value.password,
        deleted: convertBoolean(value.deleted)
      };

      const updatedUser: User = await userAdminController.updateUser(userId, data, profile);
      return res.status(STATUS_CODE.OK).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  upload(req, res, (err) => {
    const info: MulterUpdateFile = {
      contentType,
      fieldname: fileParamName,
      req,
      err,
      next
    };

    updateFileFunc(info, updateFunc);
  });
});

router.delete("/:user_ids", canView, async (req: Request, res: Response, next: NextFunction) => {
  const userIds: number[] = req.params.user_ids.split(",").map(Number);
  const numberUserIds: number[] = userIds.filter((val) => {
    return !isNaN(val);
  });

  try {
    if (!numberUserIds || numberUserIds.length <= 0) throw new BadRequestError("user ID must be a number type");

    await userAdminController.deleteUsers(numberUserIds);
    return res.status(STATUS_CODE.OK).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
