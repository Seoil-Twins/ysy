import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import InquireController from "../controller/inquiry.controller";
import InquireService from "../services/inquiry.service";
import InquireImageService from "../services/inquiryImage.service";

import validator from "../utils/validator.util";
import { STATUS_CODE } from "../constants/statusCode.constant";

import { CreateInquiry, ResponseInquiry, PageOptions } from "../types/inquiry.type";

import BadRequestError from "../errors/badRequest.error";
import ForbiddenError from "../errors/forbidden.error";
import { multerUpload } from "../utils/multer";
import { ContentType } from "../utils/router.util";
import { File } from "../utils/gcp.util";

const router: Router = express.Router();
const inquireService: InquireService = new InquireService();
const inquireImageService: InquireImageService = new InquireImageService();
const inquireController: InquireController = new InquireController(inquireService, inquireImageService);
const MAX_IMAGE_COUNT = 5;

const postSchema: joi.Schema = joi.object({
  title: joi.string().required(),
  contents: joi.string().required()
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId: number = Number(req.userId);
  const page: number = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
  const count: number = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 10;

  try {
    if (isNaN(userId)) throw new ForbiddenError("User ID must be a number type with token payload");

    const pageOptions: PageOptions = {
      page,
      count,
      sort: "r"
    };

    const results: ResponseInquiry = await inquireController.getInquires(userId, pageOptions);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.post("/", multerUpload.array("images", MAX_IMAGE_COUNT), async (req: Request, res: Response, next: NextFunction) => {
  const contentType: ContentType = req.contentType;
  const createFunc = async (images?: File[]) => {
    try {
      const userId: number = Number(req.userId);
      const { value, error }: ValidationResult = validator(req.body, postSchema);
      if (error) throw new BadRequestError(error.message);
      if (isNaN(userId)) throw new ForbiddenError("User ID must be a number type with token payload");

      const data: CreateInquiry = {
        userId,
        title: value.title,
        contents: value.contents
      };
      const url: string = await inquireController.addInquire(data, images);

      res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  };

  try {
    if (contentType === "form-data") {
      if (!req.files) throw new BadRequestError("You must request images");
      else if (req.originalFileNames?.length !== req.files.length)
        throw new BadRequestError("The image is not uploaded properly. Please check if there are any damaged images.");

      createFunc(req.files as File[]);
    } else {
      createFunc(undefined);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
