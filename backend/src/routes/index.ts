import express, { Router } from "express";

import userRouter from "./user.route.js";
import authRouter from "./auth.route.js";
import coupleRouter from "./couple.route.js";
import albumRouter from "./album.route.js";
import calendarRouter from "./calendar.route.js";
import inquireRouter from "./inquiry.route.js";
import noticeRouter from "./notice.route.js";
import datePlaceRouter from "./datePlace.route.js";
import datePlaceViewRouter from "./datePlaceView.route.js";
import FavoriteRouter from "./favorite.route.js";

import userAdminRouter from "./user.admin.route.js";
import coupleAdminRouter from "./couple.admin.route.js";
import albumAdminRouter from "./album.admin.route.js";
import calendarAdminRouter from "./calendar.admin.route.js";
import InquireAdminRouter from "./inquire.admin.route.js";
import InquireImageAdminRouter from "./inquireImage.admin.route.js";
import SolutionAdminRouter from "./solution.admin.route.js";
import SolutionImageAdminRouter from "./solutionImage.admin.route.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import checkContentType from "../middlewares/contentType.middleware.js";

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
router.use("/favorite", checkContentType, authMiddleware, FavoriteRouter);

// router.use("/admin/user", authMiddleware, userAdminRouter);
// router.use("/admin/couple", authMiddleware, coupleAdminRouter);
// router.use("/admin/album", authMiddleware, albumAdminRouter);
// router.use("/admin/calendar", authMiddleware, calendarAdminRouter);
// router.use("/admin/inquire", authMiddleware, InquireAdminRouter);
// router.use("/admin/inquire-image", authMiddleware, InquireImageAdminRouter);
// router.use("/admin/solution", authMiddleware, SolutionAdminRouter);
// router.use("/admin/solution-image", authMiddleware, SolutionImageAdminRouter);

// router.use("/admin/restaurant", authMiddleware, restaurantAdminRouter);
// router.use("/admin/culture", authMiddleware, cultureAdminRouter);
// router.use("/admin/shopping", authMiddleware, shoppingAdminRouter);
// router.use("/admin/sports", authMiddleware, sportsAdminRouter);
// router.use("/admin/tourist_spot", authMiddleware, touristSpotAdminRouter);

export default router;
