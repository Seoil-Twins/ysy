import express, { Router, Request, Response, NextFunction } from "express";
import { CreatePageOption, PageOptions, convertStringtoDate, createPageOptions } from "../utils/pagination.util.js";
import { FilterOptions, ImageType, ResponseAlbumImage, SearchOptions, SortItem, isImageType, isSortItem } from "../types/albumImage.type.js";
import AlbumService from "../services/album.service.js";
import AlbumImageService from "../services/albumImage.service.js";
import AlbumImageAdminService from "../services/albumImage.admin.service.js";
import AlbumImageAdminController from "../controllers/albumImage.admin.controller.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import logger from "../logger/logger.js";

const router: Router = express.Router();

const albumService: AlbumService = new AlbumService();
const albumImageService: AlbumImageService = new AlbumImageService();
const albumImageAdminService: AlbumImageAdminService = new AlbumImageAdminService();
const albumImageAdminController: AlbumImageAdminController = new AlbumImageAdminController(albumService, albumImageService, albumImageAdminService);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const albumId: number = Number(req.query.album_id);
  const cupId: string | undefined = req.query.cup_id ? String(req.query.cup_id) : undefined;
  const imageType: ImageType | undefined = isImageType(req.query.type) ? req.query.type : undefined;
  const createdPageOptions: CreatePageOption<SortItem> = {
    count: Number(req.query.count),
    page: Number(req.query.page),
    sort: String(req.query.sort),
    defaultValue: "r",
    isSortItem: isSortItem
  };
  const pageOptions: PageOptions<SortItem> = createPageOptions<SortItem>(createdPageOptions);
  const searchOptions: SearchOptions = {
    albumId: !isNaN(albumId) ? albumId : undefined,
    cupId,
    type: imageType
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
    const results: ResponseAlbumImage = await albumImageAdminController.getImages(pageOptions, searchOptions, filterOptions);

    logger.debug(`Response Data => ${JSON.stringify(results)}`);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
