import express, { Router, Request, Response, NextFunction } from "express";
import formidable from "formidable";

import { IUserResponse, IUserResponseWithCount } from "../model/user.model";

import userController from "../controller/user.controller";

import logger from "../logger/logger";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";

const router: Router = express.Router();

//------------------------------------------------------------------ User ------------------------------------------------------------------//
router.get("/user", async (req: Request, res: Response, next: NextFunction) => {
    const sort: string = String(req.query.sort) || "na",
        count: number = Number(req.query.count) || 10,
        page: number = Number(req.query.page) || 1,
        keyword: string = String(req.query.keyword);
    const role: number = Number(req.body.role);

    try {
        if (!role) throw new ForbiddenError("Unauthorized Access");

        const result: IUserResponseWithCount = await userController.getUsersWithSearch(count, page, sort, keyword);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
