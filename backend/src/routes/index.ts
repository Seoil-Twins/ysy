import express, { Router } from "express";

import userRouter from "./user";
import authRouter from "./auth";
import coupleRouter from "./couple";
import albumRouter from "./album";
import calendarRouter from "./calendar";
import inquireRouter from "./inquire";
import noticeRouter from "./notice";

import userAdminRouter from "./user.admin";
import coupleAdminRouter from "./couple.admin";
import albumAdminRouter from "./album.admin";
import restaurantAdminRouter from "./restaurant.admin"

import authMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/notice", noticeRouter);

router.use("/user", authMiddleware, userRouter);
router.use("/couple", authMiddleware, coupleRouter);
router.use("/album", authMiddleware, albumRouter);
router.use("/calendar", authMiddleware, calendarRouter);
router.use("/inquire", authMiddleware, inquireRouter);

router.use("/admin/user", authMiddleware, userAdminRouter);
router.use("/admin/couple", authMiddleware, coupleAdminRouter);
router.use("/admin/album", authMiddleware, albumAdminRouter);
router.use("/admin/restaurant", authMiddleware, restaurantAdminRouter);

export default router;
