import express, { Router, Request, Response, NextFunction } from "express";

import logger from "../logger/logger.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

import RegionCodeService from "../services/regionCode.service.js";
import RegionCodeController from "../controllers/regionCode.controller.js";
import { RegionCode } from "../models/regionCode.model.js";

const router: Router = express.Router();
const regionCodeService: RegionCodeService = new RegionCodeService();
const regionCodeController: RegionCodeController = new RegionCodeController(regionCodeService);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const results: RegionCode[] = await regionCodeController.getRegionCode();

    logger.debug(`Response Data ${JSON.stringify(results)}`);
    res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
