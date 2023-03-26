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

export default router;
