import express, { Router, Request, Response, NextFunction } from "express";
import { boolean } from "boolean";

import logger from "../logger/logger.js";
import { ContentType } from "../utils/router.util.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import FavoriteService from "../services/favorite.service.js";
import DatePlaceService from "../services/datePlace.service.js";
import FavoriteController from "../controllers/favorite.controller.js";

import { RequestFavorite } from "../types/favorite.type.js";

import BadRequestError from "../errors/badRequest.error.js";
import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error.js";
import { Favorite } from "../models/favorite.model.js";

const router: Router = express.Router();

const favoriteService: FavoriteService = new FavoriteService();
const datePlaceService: DatePlaceService = new DatePlaceService();
const favoriteController: FavoriteController = new FavoriteController(favoriteService, datePlaceService);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results: Favorite[] | null = await favoriteController.getFavorites();

    logger.debug(`Response Data : ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.patch("/:content_id/:content_type_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const contentId: string | undefined = req.params.content_id ? String(req.params.content_id) : undefined;
  const contentTypeId: string | undefined = req.params.content_type_id ? String(req.params.content_type_id) : undefined;
  const isFavorite: boolean = boolean(req.body.isFavorite);

  try {
    if (contentType === "form-data") throw new UnsupportedMediaTypeError("This API must have a content-type of 'application/json' unconditionally.");
    else if (!contentId) throw new BadRequestError(`You must request contentId`);
    else if (!contentTypeId) throw new BadRequestError("You must request contentTypeId");

    const data: RequestFavorite = {
      userId: req.userId!,
      contentId: contentId,
      contentTypeId: contentTypeId
    };

    if (!isFavorite) {
      await favoriteController.addFavorite(data);

      logger.debug(`Success add favorite`);
    } else {
      await favoriteController.deleteFavorite(data);
    }

    return res.status(STATUS_CODE.NO_CONTENT).json();
  } catch (error) {
    next(error);
  }
});

export default router;
