import express, { Router, Request, Response, NextFunction } from "express";

import NoticeController from "../controller/notice.controller";
import NoticeSerivce from "../service/notice.service";

import { STATUS_CODE } from "../constant/statusCode.constant";

const router: Router = express.Router();
const noticeService: NoticeSerivce = new NoticeSerivce();
const noticeController: NoticeController = new NoticeController(noticeService);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let count = Number(req.query.count),
        page = Number(req.query.page);

    try {
        if (isNaN(count)) count = 1;
        if (isNaN(page)) page = 1;

        const results = await noticeController.getNotices(count, page);
        return res.status(STATUS_CODE.OK).json(results);
    } catch (error) {
        next(error);
    }
});

export default router;
