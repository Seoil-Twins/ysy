import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable, { File } from "formidable";

import AlbumController from "../controller/album.controller";
import AlbumService from "../services/album.service";
import AlbumImageService from "../services/albumImage.service";

import logger from "../logger/logger";
import validator from "../utils/validator.util";
import { ContentType } from "../utils/router.util";

import { STATUS_CODE } from "../constants/statusCode.constant";
import { MAX_FILE_COUNT, MAX_FILE_SIZE } from "../constants/file.constant";

import BadRequestError from "../errors/badRequest.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalServerError from "../errors/internalServer.error";

import { Album } from "../models/album.model";

import { ResponseAlbumFolder, ResponseAlbum, PageOptions, SortItem, isSortItem } from "../types/album.type";
import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error";

const router: Router = express.Router();
const albumService = new AlbumService();
const albumImageService = new AlbumImageService();
const albumController = new AlbumController(albumService, albumImageService);

const titleSchema: joi.Schema = joi.object({
  title: joi.string().required()
});

// 앨범 정보 가져오기
router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
  const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 50;
  const sort: SortItem = isSortItem(req.query.sort) ? req.query.sort : "r";

  try {
    if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

    const pageOptions: PageOptions = {
      page: page,
      count: count,
      sort: sort
    };
    const results: ResponseAlbumFolder = await albumController.getAlbumsFolder(req.cupId!, pageOptions);

    logger.debug(`Response Data : ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

// 한 앨범 정보 가져오기
router.get("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const albumId: number = Number(req.params.album_id);
    const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
    const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 50;
    const sort: SortItem = isSortItem(req.query.sort) ? req.query.sort : "r";

    if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

    const pageOptions: PageOptions = {
      page: page,
      count: count,
      sort: sort
    };
    const result: ResponseAlbum = await albumController.getAlbums(albumId, pageOptions);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

// 앨범 추가
router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value, error }: ValidationResult = validator(req.body, titleSchema);

    if (error) throw new BadRequestError(error.message);
    else if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

    const url: string = await albumController.addAlbumFolder(req.cupId!, value.title);

    return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
  } catch (error) {
    next(error);
  }
});

// 앨범 사진 추가
router.post("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const form = formidable({ multiples: true, maxFileSize: MAX_FILE_SIZE, maxFiles: MAX_FILE_COUNT });

  const createFunc = async (images: File | File[]) => {
    try {
      const albumId = Number(req.params.album_id);

      if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
      else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

      const url: string = await albumController.addImages(req.cupId!, albumId, images);

      return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  };

  if (contentType === "form-data") {
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
        if (!files.images) throw new BadRequestError("You must request images");

        createFunc(files.images);
      } catch (error) {
        next(error);
      }
    });
  } else {
    next(new UnsupportedMediaTypeError("This API must have a content-type of 'multipart/form-data' unconditionally."));
  }
});

// 앨범 제목 변경
router.patch("/:cup_id/:album_id/title", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const albumId = Number(req.params.album_id);
    const { value, error }: ValidationResult = validator(req.body, titleSchema);
    if (error) throw new BadRequestError(error.message);

    if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

    const album: Album = await albumController.updateTitle(albumId, req.cupId!, value.title);

    return res.status(STATUS_CODE.OK).json(album);
  } catch (error) {
    next(error);
  }
});

// 앨범 대표 사진 변경
router.patch("/:cup_id/:album_id/thumbnail", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE });
  const albumId: number = Number(req.params.album_id);

  const updateThumbnailFunc = async (req: Request, thumbnail: File | null) => {
    const albumId: number = Number(req.params.album_id);
    if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

    const album: Album = await albumController.updateThumbnail(albumId, req.cupId!, thumbnail);
    return res.status(STATUS_CODE.OK).json(album);
  };

  if (contentType === "form-data") {
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

        const thumbnail: File | File[] = files.thumbnail;
        console.log(thumbnail);

        if (!thumbnail) throw new BadRequestError("You must request only one thumbnail");
        else if (Array.isArray(thumbnail)) throw new BadRequestError("You must request only one thumbnail");

        updateThumbnailFunc(req, thumbnail);
      } catch (error) {
        next(error);
      }
    });
  } else if (contentType === "json") {
    if (req.body.thumbnail === "null" || req.body.thumbnail === null) {
      updateThumbnailFunc(req, null);
    } else {
      next(new BadRequestError("You must request only 'null'"));
    }
  }
});

router.delete("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const albumId = Number(req.params.album_id);

    if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

    await albumController.deleteAlbum(req.cupId, albumId);

    return res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

router.delete("/:cup_id/:album_id/image/:image_ids", async (req: Request, res: Response, next: NextFunction) => {
  const imageIds: number[] = req.params.image_ids.split(",").map(Number);
  const numImageIds: number[] = imageIds.filter((imageId: number) => {
    if (!isNaN(imageId)) return imageId;
  });

  try {
    const albumId = Number(req.params.album_id);
    const cupId: string | null = req.cupId;

    if (!numImageIds || numImageIds.length <= 0) throw new BadRequestError("No album ids");
    else if (!cupId) throw new ForbiddenError("You don't have couple ID in request body");
    else if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
    else if (isNaN(albumId)) throw new BadRequestError("Album Id must be a number type");

    await albumController.deleteAlbumImages(cupId, albumId, numImageIds);
    res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
