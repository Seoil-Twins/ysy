import express, { Router, Request, Response, NextFunction } from "express";

import noticeController from "../controller/notice.controller";
import StatusCode from "../util/statusCode";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    let count = Number(req.query.count),
        page = Number(req.query.page);

    try {
        if (isNaN(count)) count = 1;
        if (isNaN(page)) page = 1;

        const results = await noticeController.getNotices(count, page);
        return res.status(StatusCode.OK).json(results);
    } catch (error) {
        next(error);
    }
});

export default router;
