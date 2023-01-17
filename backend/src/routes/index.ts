import express, { Router } from "express";

import userRouter from "./user";
import authRouter from "./auth";
import coupleRouter from "./couple";
import authMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);
router.use("/couple", authMiddleware, coupleRouter);

export default router;
