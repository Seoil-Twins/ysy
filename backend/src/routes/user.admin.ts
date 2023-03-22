import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable from "formidable";
import { boolean } from "boolean";

import {
    ICreateWithAdmin,
    IUpdateWithAdmin,
    IUserResponseWithCount,
    PageOptions as UserPageOptions,
    SearchOptions as UserSearchOptions,
    FilterOptions as UserFilterOptions,
    User
} from "../model/user.model";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";
import { canModifyWithEditor, canView } from "../util/checkRole";

import BadRequestError from "../error/badRequest";
import InternalServerError from "../error/internalServer";

import UserAdminController from "../controller/user.admin.controller";
import UserService from "../service/user.service";
import UserAdminService from "../service/user.admin.service";
import UserRoleService from "../service/userRole.service";
import CoupleAdminService from "../service/couple.admin.service";
import AlbumService from "../service/album.service";
import InquireService from "../service/inquire.service";
import CalendarService from "../service/calendar.service";
import InquireImageService from "../service/inquireImage.service";

dayjs.locale("ko");

const router: Router = express.Router();
const userService: UserService = new UserService();
const userAdminService: UserAdminService = new UserAdminService();
const userRoleService: UserRoleService = new UserRoleService();
const coupleAdminService: CoupleAdminService = new CoupleAdminService();
const albumService: AlbumService = new AlbumService();
const calendarservice: CalendarService = new CalendarService();
const inquireService: InquireService = new InquireService();
const inquireImageService: InquireImageService = new InquireImageService();
const userAdminController: UserAdminController = new UserAdminController(
    userService,
    userAdminService,
    userRoleService,
    coupleAdminService,
    albumService,
    calendarservice,
    inquireService,
    inquireImageService
);

const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/;
const phonePattern = /^[0-9]+$/;
const createSchema: joi.Schema = joi.object({
    snsId: joi.string().length(4).required(),
    name: joi.string().max(8).trim().required(),
    code: joi.string().trim(),
    password: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)).required(),
    email: joi.string().trim().email().required(),
    phone: joi.string().trim().length(11).regex(RegExp(phonePattern)).required(),
    birthday: joi
        .date()
        .greater(new Date("1980-01-01")) // 1980-01-01보다 더 큰 날짜여야 함.
        .less(new Date("2023-12-31"))
        .required(), // 2023-12-31보다 낮은 날짜여야 함.
    eventNofi: joi.bool().default(false).required(),
    primaryNofi: joi.bool().default(false).required(),
    dateNofi: joi.bool().default(false).required(),
    role: joi.number().min(1).max(4).required()
});
const updateSchema: joi.Schema = joi.object({
    name: joi.string().max(8).trim(),
    code: joi.string().trim(),
    password: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)),
    email: joi.string().trim().email(),
    phone: joi.string().trim().length(11).regex(RegExp(phonePattern)),
    birthday: joi
        .date()
        .greater(new Date("1980-01-01")) // 1980-01-01보다 더 큰 날짜여야 함.
        .less(new Date("2023-12-31")), // 2023-12-31보다 낮은 날짜여야 함.
    eventNofi: joi.bool().default(false),
    primaryNofi: joi.bool().default(false),
    dateNofi: joi.bool().default(false),
    delete: joi.bool().default(false),
    role: joi.number().min(1).max(4)
});

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: UserPageOptions = {
        count: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "na"
    };
    const searchOptions: UserSearchOptions = {
        name: String(req.query.name) || undefined,
        snsId: String(req.query.sns_id) || undefined
    };
    const filterOptions: UserFilterOptions = {
        isCouple: boolean(req.query.couple) || false,
        isDeleted: boolean(req.query.deleted) || false
    };

    try {
        const result: IUserResponseWithCount = await userAdminController.getUsersWithSearch(pageOptions, searchOptions, filterOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            req.body = Object.assign({}, req.body, fields);
            const { value, error }: ValidationResult = validator(req.body, createSchema);

            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            else if (error) throw new BadRequestError(error.message);
            else if (files.file instanceof Array<formidable.File>) throw new BadRequestError("You must request only one profile");

            const data: ICreateWithAdmin = {
                snsId: value.snsId,
                name: value.name,
                email: value.email,
                code: value.code,
                password: value.password,
                phone: value.phone,
                birthday: value.birthday,
                primaryNofi: value.primaryNofi,
                eventNofi: value.eventNofi,
                dateNofi: value.dateNofi,
                role: value.role
            };

            const url: string = await userAdminController.createUser(data, files.file);
            return res.header({ Location: url }).status(StatusCode.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.patch("/:user_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            const userId = Number(req.params.user_id);
            req.body = Object.assign({}, req.body, fields);
            const { value, error }: ValidationResult = validator(req.body, updateSchema);

            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            else if (isNaN(userId)) throw new BadRequestError("User ID must be a number type");
            else if (error) throw new BadRequestError(error.message);
            else if (files.file instanceof Array<formidable.File>) throw new BadRequestError("You must request only one profile");

            const data: IUpdateWithAdmin = {
                name: value.name,
                email: value.email,
                code: value.code,
                password: value.password,
                phone: value.phone,
                birthday: value.birthday,
                primaryNofi: value.primaryNofi,
                eventNofi: value.eventNofi,
                dateNofi: value.dateNofi,
                deleted: value.deleted,
                role: value.role
            };

            const user: User = await userAdminController.updateUser(userId, data, files.file);

            return res.status(StatusCode.OK).json(user);
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:user_ids", canView, async (req: Request, res: Response, next: NextFunction) => {
    const userIds: number[] = req.params.user_ids.split(",").map(Number);
    const numberUserIds: number[] = userIds.filter((val) => {
        return !isNaN(val);
    });

    try {
        if (!numberUserIds || numberUserIds.length <= 0) throw new BadRequestError("user ID must be a number type");

        await userAdminController.deleteUser(numberUserIds);
        return res.status(StatusCode.OK).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
