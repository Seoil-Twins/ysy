import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import InquireController from "../controller/inquire.controller";
import InquireService from "../services/inquire.service";
import InquireImageService from "../services/inquireImage.service";

import validator from "../utils/validator.util";
import { STATUS_CODE } from "../constant/statusCode.constant";

import { ICreate, Inquire, IUpdateWithController } from "../models/inquiry.model";

import BadRequestError from "../errors/badRequest.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalServerError from "../errors/internalServer.error";

const router: Router = express.Router();
const inquireService: InquireService = new InquireService();
const inquireImageService: InquireImageService = new InquireImageService();
const inquireController: InquireController = new InquireController(inquireService, inquireImageService);

const postSchema: joi.Schema = joi.object({
  title: joi.string().required(),
  contents: joi.string().required()
});

const updateSchema: joi.Schema = joi.object({
  title: joi.string(),
  contents: joi.string()
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const userId = Number(req.body.userId);

  try {
    if (isNaN(userId)) throw new ForbiddenError("User ID must be a number type with token payload");

    const results: Inquire[] = await inquireController.getInquires(userId);
    return res.status(STATUS_CODE.OK).json(results);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });

  form.parse(req, async (err, fields, files) => {
    if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

    req.body = Object.assign({}, req.body, fields);
    const { value, error }: ValidationResult = validator(req.body, postSchema);
    const inquireData: ICreate = {
      userId: value.userId,
      title: value.title,
      contents: value.contents
    };

    try {
      if (error) throw new BadRequestError(error.message);

      const url: string = await inquireController.addInquire(inquireData, files.file);
      res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
    } catch (error) {
      next(error);
    }
  });
});

router.patch("/:inquire_id", async (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });
  const inquireId = Number(req.params.inquire_id);

  form.parse(req, async (err, fields, files) => {
    if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
    else if (isNaN(inquireId)) throw new BadRequestError("Inquire ID must be a number type");

    req.body = Object.assign({}, req.body, fields);

    const { value, error }: ValidationResult = validator(req.body, updateSchema);
    const inquireData: IUpdateWithController = {
      inquireId: inquireId,
      title: value.title ? String(value.title) : undefined,
      contents: value.contents ? String(value.contents) : undefined
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

router.delete("/:inquire_id", async (req: Request, res: Response, next: NextFunction) => {
  const inquireId = Number(req.params.inquire_id);

  try {
    if (isNaN(inquireId)) throw new BadRequestError("Inquire ID must be a number type");

    await inquireController.deleteInquire(inquireId);
    res.status(STATUS_CODE.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
