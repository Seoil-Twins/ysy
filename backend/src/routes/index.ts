import express, { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import checkContentType from "../middlewares/contentType.middleware.js";

import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import coupleRouter from "./couple.route.js";
import albumRouter from "./album.route.js";
import calendarRouter from "./calendar.route.js";
import inquireRouter from "./inquiry.route.js";
import noticeRouter from "./notice.route.js";
import datePlaceRouter from "./datePlace.route.js";
import datePlaceViewRouter from "./datePlaceView.route.js";
import favoriteRouter from "./favorite.route.js";
import regionCodeRouter from "./region.route.js";
import contentTypeRouter from "./contentType.route.js";

import authAdminRouter from "./auth.admin.route.js";
import userAdminRouter from "./user.admin.route.js";
import coupleAdminRouter from "./couple.admin.route.js";
import albumAdminRouter from "./album.admin.route.js";
import albumImageAdminRouter from "./albumImage.admin.route.js";
// import calendarAdminRouter from "./calendar.admin.route.js";
// import InquireAdminRouter from "./inquire.admin.route.js";
// import InquireImageAdminRouter from "./inquireImage.admin.route.js";
// import SolutionAdminRouter from "./solution.admin.route.js";
// import SolutionImageAdminRouter from "./solutionImage.admin.route.js";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/user", checkContentType, authMiddleware, userRouter);
router.use("/couple", checkContentType, authMiddleware, coupleRouter);
router.use("/album", checkContentType, authMiddleware, albumRouter);
router.use("/calendar", checkContentType, authMiddleware, calendarRouter);
router.use("/inquiry", checkContentType, authMiddleware, inquireRouter);
router.use("/notice", authMiddleware, noticeRouter);
router.use("/date-place", authMiddleware, datePlaceRouter);
router.use("/date-place/views", authMiddleware, datePlaceViewRouter);
router.use("/favorite", authMiddleware, favoriteRouter);
// router.use("/favorite", checkContentType, authMiddleware, favoriteRouter);
router.use("/region-code", authMiddleware, regionCodeRouter);
router.use("/content-type", authMiddleware, contentTypeRouter);

router.use("/admin/auth", authAdminRouter);
router.use("/admin/user", checkContentType, authMiddleware, userAdminRouter);
router.use("/admin/couple", checkContentType, authMiddleware, coupleAdminRouter);
router.use("/admin/album", checkContentType, authMiddleware, albumAdminRouter);
router.use("/admin/album-image", checkContentType, authMiddleware, albumImageAdminRouter);
// router.use("/admin/calendar", authMiddleware, calendarAdminRouter);
// router.use("/admin/inquire", authMiddleware, InquireAdminRouter);
// router.use("/admin/inquire-image", authMiddleware, InquireImageAdminRouter);
// router.use("/admin/solution", authMiddleware, SolutionAdminRouter);
// router.use("/admin/solution-image", authMiddleware, SolutionImageAdminRouter);

export default router;
