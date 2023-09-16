import express, { Router, Request, Response, NextFunction } from "express";

import NoticeController from "../controllers/notice.controller.js";
import NoticeSerivce from "../services/notice.service.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import { PageOptions, ResponseNotice } from "../types/noitce.type.js";

const router: Router = express.Router();
const noticeService: NoticeSerivce = new NoticeSerivce();
const noticeController: NoticeController = new NoticeController(noticeService);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
  const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 10;

  try {
    const pageOptions: PageOptions = {
      count,
      page,
      sort: "r"
    };
    const results: ResponseNotice = await noticeController.getNotices(pageOptions);

    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
