import express, { Router, Request, Response, NextFunction } from "express";

import logger from "../logger/logger.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import DatePlaceService from "../services/datePlace.service.js";
import DatePlaceViewService from "../services/datePlaceView.service.js";
import DatePlaceViewController from "../controllers/datePlaceView.controller.js";

import { DatePlace } from "../models/datePlace.model.js";

import BadRequestError from "../errors/badRequest.error.js";

const router: Router = express.Router();

const datePlaceService: DatePlaceService = new DatePlaceService();
const datePlaceViewService: DatePlaceViewService = new DatePlaceViewService();
const datePlaceViewController: DatePlaceViewController = new DatePlaceViewController(datePlaceViewService, datePlaceService);

router.patch("/:content_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentId: string | undefined = req.params.content_id;

  try {
    if (!contentId) throw new BadRequestError("'content_id' is require parameter.");

    const results: DatePlace = await datePlaceViewController.increaseView(req.userId!, contentId);

    logger.debug(`Response Data : ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
