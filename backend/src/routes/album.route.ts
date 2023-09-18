import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import AlbumController from "../controllers/album.controller.js";
import AlbumService from "../services/album.service.js";
import AlbumImageService from "../services/albumImage.service.js";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { ContentType } from "../utils/router.util.js";
import { isDefaultFile, multerUpload } from "../utils/multer.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import BadRequestError from "../errors/badRequest.error.js";
import ForbiddenError from "../errors/forbidden.error.js";
import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error.js";

import { Album } from "../models/album.model.js";

import { ResponseAlbumFolder, ResponseAlbum, PageOptions, SortItem, isSortItem } from "../types/album.type.js";

const router: Router = express.Router();
const albumService = new AlbumService();
const albumImageService = new AlbumImageService();
const albumController = new AlbumController(albumService, albumImageService);
const MAX_IMAGE_COUNT = 100;

const titleSchema: joi.Schema = joi.object({
  title: joi.string().required()
});

const mergeSchema: joi.Schema = joi.object({
  title: joi.string().required(),
  albumId: joi.number().required(),
  targetIds: joi.array().items(joi.number()).required()
});

// 앨범 정보 가져오기
router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
  const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 50;
  const sort: SortItem = isSortItem(req.query.sort) ? req.query.sort : "r";
  req.cupId = req.params.cup_id; // 꼭! 지워야함! 테스트를 위한 코드
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
    const sort: SortItem = "r";

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

    req.cupId = req.params.cup_id; // 꼭! 지워야함! 테스트를 위한 코드
    if (error) throw new BadRequestError(error.message);
    else if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

    const url: string = await albumController.addAlbumFolder(req.cupId!, value.title);

    return res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
  } catch (error) {
    next(error);
  }
});

// 앨범 사진 추가
router.post("/:cup_id/:album_id", multerUpload.array("images", MAX_IMAGE_COUNT), async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;

  const createFunc = async (images: Express.Multer.File[]) => {
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

  try {
    if (contentType === "form-data") {
      if (!req.files) throw new BadRequestError("You must request images");
      else if (req.originalFileNames?.length !== req.files.length)
        throw new BadRequestError("The image is not uploaded properly. Please check if there are any damaged images.");

      createFunc(req.files as Express.Multer.File[]);
    } else {
      throw new UnsupportedMediaTypeError("This API must have a content-type of 'multipart/form-data' unconditionally.");
    }
  } catch (error) {
    next(error);
  }
});

// 앨범 합치기
router.patch("/merge/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;

  try {
    if (contentType === "form-data") throw new UnsupportedMediaTypeError("This API must have a content-type of 'json' unconditionally.");

    const { value, error }: ValidationResult = validator(req.body, mergeSchema);
    if (error) throw new BadRequestError(error);

    const albumId: number = value.albumId;
    const targerIds: number[] = value.targetIds;

    const url: string = await albumController.mergeAlbum(req.cupId!, albumId, targerIds, value.title);
    return res.header({ Location: url }).status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
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
router.patch("/:cup_id/:album_id/thumbnail", multerUpload.single("thumbnail"), async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;

  try {
    const updateThumbnailFunc = async (req: Request, thumbnail: Express.Multer.File | null) => {
      try {
        const albumId: number = Number(req.params.album_id);
        if (req.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

        const album: Album = await albumController.updateThumbnail(albumId, req.cupId!, thumbnail);
        return res.status(STATUS_CODE.OK).json(album);
      } catch (error) {
        next(error);
      }
    };

    if (contentType === "form-data") {
      const thumbnail: Express.Multer.File | undefined = req.file;
      if (!thumbnail) throw new BadRequestError("You must request only one thumbnail");

      updateThumbnailFunc(req, thumbnail);
    } else if (contentType === "json" && isDefaultFile(req.body.thumbnail)) {
      updateThumbnailFunc(req, null);
    } else {
      throw new UnsupportedMediaTypeError("You must request any data");
    }
  } catch (error) {
    next(error);
  }
});

// 앨범 삭제
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

// 앨범 이미지 삭제
router.delete("/:cup_id/:album_id/images", async (req: Request, res: Response, next: NextFunction) => {
  const imageIds: string[] | undefined = Array.isArray(req.body.imageIds) ? [...req.body.imageIds] : undefined;
  const numImageIds: number[] | undefined = imageIds?.map(Number).filter((imageId: number) => {
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
