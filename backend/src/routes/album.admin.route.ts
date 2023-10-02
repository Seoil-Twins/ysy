import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";

import AlbumService from "../services/album.service.js";
import AlbumAdminService from "../services/album.admin.service.js";
import AlbumImageService from "../services/albumImage.service.js";
import AlbumAdminController from "../controllers/album.admin.controller.js";

import { Album } from "../models/album.model.js";
import { ResponseAlbumFolder, ResponseAlbum, SearchOptions, FilterOptions } from "../types/album.type.js";

import logger from "../logger/logger.js";
import validator from "../utils/validator.util.js";
import { canModifyWithEditor, canView } from "../utils/checkRole.util.js";

import { STATUS_CODE } from "../constants/statusCode.constant.js";

import BadRequestError from "../errors/badRequest.error.js";
import InternalServerError from "../errors/internalServer.error.js";
import { CreatePageOption, PageOptions, convertStringtoDate, createPageOptions } from "../utils/pagination.util.js";
import { SortItem, isSortItem } from "../types/album.type.js";
import { ContentType } from "../utils/router.util.js";
import { MulterFieldUploadFile, multerUpload, uploadFieldsFunc } from "../utils/multer.js";
import { File } from "../utils/gcp.util.js";
import UnsupportedMediaTypeError from "../errors/unsupportedMediaType.error.js";
import CoupleService from "../services/couple.service.js";
import AlbumController from "../controllers/album.controller.js";

const router: Router = express.Router();
const albumService: AlbumService = new AlbumService();
const albumAdminService: AlbumAdminService = new AlbumAdminService();
const albumImageService: AlbumImageService = new AlbumImageService();
const coupleService: CoupleService = new CoupleService();

const albumController = new AlbumController(albumService, albumImageService);
const albumAdminController: AlbumAdminController = new AlbumAdminController(albumService, albumAdminService, albumImageService, coupleService);

const createSchema: joi.Schema = joi.object({
  title: joi.string().required()
});

const mergeSchema: joi.Schema = joi.object({
  title: joi.string().required(),
  albumId: joi.number().required(),
  targetIds: joi.array().items(joi.number()).required()
});

const updateSchema: joi.Schema = joi.object({
  cupId: joi.string(),
  title: joi.string()
});

const thumbnailParamName = "thumbnail";
const imageParamName = "images";
const upload = multerUpload.fields([
  { name: thumbnailParamName, maxCount: 1 },
  { name: imageParamName, maxCount: 300 }
]);

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
  const createdPageOptions: CreatePageOption<SortItem> = {
    count: Number(req.query.count),
    page: Number(req.query.page),
    sort: String(req.query.sort),
    defaultValue: "r",
    isSortItem: isSortItem
  };
  const pageOptions: PageOptions<SortItem> = createPageOptions<SortItem>(createdPageOptions);
  const searchOptions: SearchOptions = {
    cupId: req.query.cup_id ? String(req.query.cup_id) : undefined
  };

  const { fromDate, toDate }: { fromDate?: Date; toDate?: Date } = convertStringtoDate({
    strStartDate: req.query.from_date,
    strEndDate: req.query.to_date
  });

  const filterOptions: FilterOptions = {
    fromDate,
    toDate
  };

  try {
    const result: ResponseAlbumFolder = await albumAdminController.getAlbumFolders(pageOptions, searchOptions, filterOptions);

    logger.debug(`Response Data => ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:album_id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const albumId: number = Number(req.params.album_id);
    const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
    const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 50;
    const sort: SortItem = "r";

    if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

    const pageOptions: PageOptions<SortItem> = {
      page: page,
      count: count,
      sort: sort
    };
    const result: ResponseAlbum = await albumAdminController.getAlbum(albumId, pageOptions);

    logger.debug(`Response Data : ${JSON.stringify(result)}`);
    return res.status(STATUS_CODE.OK).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/:cup_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const cupId: string = String(req.params.cup_id);
  if (contentType === "json") throw new UnsupportedMediaTypeError("This API must have a content-type of 'multipart/form-data' unconditionally.");

  const createFunc = async (singleFiles: Record<string, File>, multipleFiles: Record<string, File[]>) => {
    try {
      const thumbnail: File | undefined = singleFiles[thumbnailParamName] ? singleFiles[thumbnailParamName] : undefined;
      const images: File[] | undefined = multipleFiles[imageParamName] ? multipleFiles[imageParamName] : undefined;

      const { value, error }: ValidationResult = validator(req.body, createSchema);
      if (error) throw new BadRequestError(error.message);

      const url: string = await albumAdminController.addAlbum(cupId, value.title, thumbnail, images);
      res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  };

  upload(req, res, (err) => {
    const info: MulterFieldUploadFile = {
      contentType,
      req,
      err,
      next,
      singleFieldNames: [thumbnailParamName],
      multipleFieldNames: [imageParamName]
    };

    uploadFieldsFunc(info, createFunc);
  });
});

router.post("/merge/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
  const cupId: string = String(req.params.cup_id);
  const contentType: ContentType = req.contentType;

  try {
    if (contentType === "form-data") throw new UnsupportedMediaTypeError("This API must have a content-type of 'json' unconditionally.");

    const { value, error }: ValidationResult = validator(req.body, mergeSchema);
    if (error) throw new BadRequestError(error);

    const albumId: number = value.albumId;
    const targerIds: number[] = value.targetIds;

    const url: string = await albumController.mergeAlbum(cupId, albumId, targerIds, value.title);
    return res.header({ Location: url }).status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

// router.post("/:cup_id/:album_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
//   const cupId: string | undefined = req.params.cup_id ? String(req.params.cup_id) : undefined;
//   const albumId: number | undefined = req.params.album_id ? Number(req.params.album_id) : undefined;
//   const form = formidable({ multiples: true, maxFieldsSize: 5 * 1024 * 1024, maxFiles: 100 });

//   form.parse(req, async (err, _fields, files) => {
//     try {
//       if (!cupId) throw new BadRequestError("You must be request couple ID");
//       else if (!albumId) throw new BadRequestError("You must be request album ID");

//       if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
//       else if (!files.images) throw new BadRequestError("You must be request album images");

//       const url: string = await albumAdminController.addImages(albumId, files.images);

//       res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
//     } catch (error) {
//       next(error);
//     }
//   });
// });

// router.patch("/:cup_id/:album_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
//   const cupId: string | undefined = req.params.cup_id ? String(req.params.cup_id) : undefined;
//   const albumId: number | undefined = req.params.album_id ? Number(req.params.album_id) : undefined;
//   const form = formidable({ multiples: false, maxFieldsSize: 5 * 1024 * 1024, maxFiles: 100 });

//   form.parse(req, async (err, fields, files) => {
//     try {
//       if (!cupId) throw new BadRequestError("Required Couple Id");
//       else if (!albumId) throw new BadRequestError("You must be request album ID");

//       req.body = Object.assign({}, req.body, fields);
//       req.body.cupId = req.params.cup_id ? String(req.params.cup_id) : undefined;
//       const { error }: ValidationResult = validator(req.body, updateSchema);
//       const thumbnail: File | File[] | undefined = files.thumbnail;
//       const title: string | undefined = req.body.title ? String(req.body.title) : undefined;

//       if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
//       else if (error) throw new BadRequestError(error.message);
//       else if (!thumbnail && !title) throw new BadRequestError("Request values is empty");
//       else if (thumbnail instanceof Array<formidable.File>) throw new BadRequestError("You must request only one thumbnail");

//       const data: IUpdateWithAdmin = { title };
//       const updatedAlbum: Album = await albumAdminController.updateAlbum(albumId, data, thumbnail);

//       res.status(STATUS_CODE.OK).json(updatedAlbum);
//     } catch (error) {
//       next(error);
//     }
//   });
// });

// router.delete("/:album_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
//   const albumIds: number[] = req.params.album_ids.split(",").map(Number);
//   const numAlbumIds: number[] = albumIds.filter((albumId: number) => {
//     if (!isNaN(albumId)) return albumId;
//   });

//   try {
//     if (!numAlbumIds || numAlbumIds.length <= 0) throw new BadRequestError("Album ID must be a number type");

//     await albumAdminController.deleteAlbums(numAlbumIds);
//     res.status(STATUS_CODE.NO_CONTENT).json({});
//   } catch (error) {
//     next(error);
//   }
// });

// router.delete("/image/:image_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
//   const imageIds: number[] = req.params.image_ids.split(",").map(Number);
//   const numImageIds: number[] = imageIds.filter((imageId: number) => {
//     if (!isNaN(imageId)) return imageId;
//   });

//   try {
//     if (!numImageIds || numImageIds.length <= 0) throw new BadRequestError("Album ID must be a number type");

//     await albumAdminController.deleteAlbumImages(numImageIds);
//     res.status(STATUS_CODE.NO_CONTENT).json({});
//   } catch (error) {
//     next(error);
//   }
// });

export default router;
