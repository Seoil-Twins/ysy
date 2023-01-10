import express, { Router } from "express";

import userRouter from "./user";
import authRouter from "./auth";
import authMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);

export default router;
