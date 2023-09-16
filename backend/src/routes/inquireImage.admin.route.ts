import dayjs from "dayjs";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable, { File } from "formidable";

import InquireService from "../services/inquiry.service";
import InquireImageService from "../services/inquiryImage.service";

import { canModifyWithEditor, canView } from "../utils/checkRole.util";
import { STATUS_CODE } from "../constants/statusCode.constant";

import { FilterOptions, InquireImageResponseWithCount, PageOptions, SearchOptions } from "../models/inquiryImage.model";

import BadRequestError from "../errors/badRequest.error";
import InternalServerError from "../errors/internalServer.error";
import InquireImageAdminService from "../services/inquireImage.admin.service";
import InquireImageAdminController from "../controllers/inquireImage.admin.controller";

const router: Router = express.Router();
const inquireService: InquireService = new InquireService();
const inquireImageService: InquireImageService = new InquireImageService();
const inquireImageAdminService: InquireImageAdminService = new InquireImageAdminService();
const inquireImageAdminController: InquireImageAdminController = new InquireImageAdminController(inquireService, inquireImageService, inquireImageAdminService);

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
  const pageOptions: PageOptions = {
    count: Number(req.query.count) || 10,
    page: Number(req.query.page) || 1,
    sort: String(req.query.sort) || "r"
  };
  const searchOptions: SearchOptions = {
    inquireId: req.query.inquire_id ? Number(req.query.inquire_id) : undefined
  };
  const filterOptions: FilterOptions = {
    fromDate: req.query.from_date ? dayjs(String(req.query.from_date)).startOf("day").utc(true).toDate() : undefined,
    toDate: req.query.to_date ? dayjs(String(req.query.to_date)).endOf("day").utc(true).toDate() : undefined
  };

  try {
    const results: InquireImageResponseWithCount = await inquireImageAdminController.getInquireImages(pageOptions, searchOptions, filterOptions);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.post("/:inquire_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const inquireId: number = Number(req.params.inquire_id);
  const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });

  form.parse(req, async (err, fields, files) => {
    try {
      if (isNaN(inquireId)) throw new BadRequestError(`Inquire ID must be a number type | ${req.params.inquire_id}`);
      else if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

      const images: File | File[] | undefined = files.images;
      if (!images) throw new BadRequestError("You should give at least 1 image");

      const url: string = await inquireImageAdminController.addInquireImages(inquireId, images);
      res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  });
});

router.delete("/:image_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const imageIds: number[] = req.params.image_ids.split(",").map(Number);
  const numInquireIds: number[] = imageIds.filter((imageId: number) => {
    if (!isNaN(imageId)) return imageId;
  });

  try {
    if (!numInquireIds || numInquireIds.length <= 0) throw new BadRequestError("Inquire image ID must be a number type");

    await inquireImageAdminController.deleteInquireImages(numInquireIds);
    res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
