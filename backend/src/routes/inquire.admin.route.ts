import dayjs from "dayjs";
import { boolean } from "boolean";
import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import InquireController from "../controller/inquire.controller";
import InquireAdminController from "../controller/inquire.admin.controller";
import InquireService from "../services/inquire.service";
import InquireAdminService from "../services/inquire.admin.service";
import InquireImageService from "../services/inquireImage.service";

import validator from "../utils/validator.util";
import { canModifyWithEditor, canView } from "../utils/checkRole.util";
import { STATUS_CODE } from "../constants/statusCode.constant";

import { FilterOptions, ICreate, IInquireResponseWithCount, Inquire, IUpdateWithController, PageOptions, SearchOptions } from "../models/inquiry.model";

import BadRequestError from "../errors/badRequest.error";
import InternalServerError from "../errors/internalServer.error";
import SolutionImageAdminService from "../services/solutionImage.admin.service";

const router: Router = express.Router();
const inquireService: InquireService = new InquireService();
const inquireAdminService: InquireAdminService = new InquireAdminService();
const inquireImageService: InquireImageService = new InquireImageService();
const solutionImageAdminService: SolutionImageAdminService = new SolutionImageAdminService();
const inquireController: InquireController = new InquireController(inquireService, inquireImageService);
const inquireAdminController: InquireAdminController = new InquireAdminController(
  inquireService,
  inquireAdminService,
  inquireImageService,
  solutionImageAdminService
);

const postSchema: joi.Schema = joi.object({
  title: joi.string().required(),
  contents: joi.string().required()
});

const updateSchema: joi.Schema = joi.object({
  title: joi.string(),
  contents: joi.string()
});

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
  const pageOptions: PageOptions = {
    count: Number(req.query.count) || 10,
    page: Number(req.query.page) || 1,
    sort: String(req.query.sort) || "r"
  };
  const searchOptions: SearchOptions = {
    userId: req.query.user_id ? Number(req.query.user_id) : undefined
  };
  const filterOptions: FilterOptions = {
    fromDate: req.query.from_date ? dayjs(String(req.query.from_date)).startOf("day").utc(true).toDate() : undefined,
    toDate: req.query.to_date ? dayjs(String(req.query.to_date)).endOf("day").utc(true).toDate() : undefined,
    hasImage: req.query.has_image ? boolean(req.query.has_image) : undefined,
    isSolution: req.query.is_solution ? boolean(req.query.is_solution) : undefined
  };

  try {
    const results: IInquireResponseWithCount = await inquireAdminController.getInquires(pageOptions, searchOptions, filterOptions);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.post("/:user_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = Number(req.params.user_id);
  const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });

  form.parse(req, async (err, fields, files) => {
    try {
      if (isNaN(userId)) throw new BadRequestError(`User ID must be a number type | ${req.params.user_id}`);
      else if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

      req.body = Object.assign({}, req.body, fields);
      const { value, error }: ValidationResult = validator(req.body, postSchema);
      const inquireData: ICreate = {
        userId: userId,
        title: value.title,
        contents: value.contents
      };

      if (error) throw new BadRequestError(error.message);

      const url: string = await inquireAdminController.addInquire(inquireData, files.file);
      res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  });
});

router.patch("/:inquire_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });
  const inquireId = Number(req.params.inquire_id);

  form.parse(req, async (err, fields, files) => {
    if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
    else if (isNaN(inquireId)) throw new BadRequestError("Inquire ID must be a number type");

    req.body = Object.assign({}, req.body, fields);

    const { value, error }: ValidationResult = validator(req.body, updateSchema);
    const inquireData: IUpdateWithController = {
      inquireId: inquireId,
      title: value.title ? value.title : undefined,
      contents: value.contents ? value.contents : undefined
    };

    try {
      if (error) throw new BadRequestError(error.message);
      else if (!inquireData.title && !inquireData.contents && !files.file) throw new BadRequestError("Request values is empty");

      const updatedInquire: Inquire = await inquireController.updateInquire(inquireData, files.file);

      res.status(STATUS_CODE.OK).json(updatedInquire);
    } catch (error) {
      next(error);
    }
  });
});

router.delete("/:inquire_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
  const inquireIds: number[] = req.params.inquire_ids.split(",").map(Number);
  const numInquireIds: number[] = inquireIds.filter((inquireId: number) => {
    if (!isNaN(inquireId)) return inquireId;
  });

  try {
    if (!numInquireIds || numInquireIds.length <= 0) throw new BadRequestError("Calendar ID must be a number type");

    await inquireAdminController.deleteInquires(numInquireIds);
    res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
