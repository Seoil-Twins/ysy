import express, { Router, Request, Response, NextFunction } from "express";

import logger from "../logger/logger.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

import ContentTypeService from "../services/contentType.service.js";
import ContentTypeController from "../controllers/contentType.controller.js";

import { ContentType } from "../models/contentType.model.js";

const router: Router = express.Router();
const contentTypeService: ContentTypeService = new ContentTypeService();
const contentTypeController: ContentTypeController = new ContentTypeController(contentTypeService);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const results: ContentType[] = await contentTypeController.getContentTypes();

    logger.debug(`Response Data ${JSON.stringify(results)}`);
    res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
