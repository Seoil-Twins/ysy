import express, { Router } from "express";

import userRouter from "./user.route";
import authRouter from "./auth.route";
import coupleRouter from "./couple.route";
import albumRouter from "./album.route";
import calendarRouter from "./calendar.route";
import inquireRouter from "./inquire.route";
import noticeRouter from "./notice.route";

import userAdminRouter from "./user.admin.route";
import coupleAdminRouter from "./couple.admin.route";
import albumAdminRouter from "./album.admin.route";
import calendarAdminRouter from "./calendar.admin.route";
import InquireAdminRouter from "./inquire.admin.route";
import InquireImageAdminRouter from "./inquireImage.admin.route";
import SolutionAdminRouter from "./solution.admin.route";
import SolutionImageAdminRouter from "./solutionImage.admin.route";
import restaurantAdminRouter from "./restaurant.admin";
import cultureAdminRouter from "./culture.admin";
import shoppingAdminRouter from "./shopping.admin";
import sportsAdminRouter from "./sports.admin";
import touristSpotAdminRouter from "./touristSpot.admin";

import authMiddleware from "../middlewares/auth.middleware";
import checkContentType from "../middlewares/contentType.middleware";

const router: Router = express.Router();

router.use("/auth", authRouter);

router.use("/user", checkContentType, authMiddleware, userRouter);
router.use("/couple", checkContentType, authMiddleware, coupleRouter);
router.use("/album", checkContentType, authMiddleware, albumRouter);
router.use("/calendar", checkContentType, authMiddleware, calendarRouter);
// router.use("/inquire", authMiddleware, inquireRouter);
// router.use("/notice", authMiddleware, noticeRouter);

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
