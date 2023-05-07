import dayjs from "dayjs";
import { boolean } from "boolean";
import formidable from "formidable";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";

import SolutionAdminService from "../service/solution.admin.service";
import SolutionImageAdminService from "../service/solutionImage.admin.service";
import InquireAdminService from "../service/inquire.admin.service";
import SolutionAdminController from "../controller/solution.admin.controller";

import { STATUS_CODE } from "../constant/statusCode.constant";

import { FilterOptions, ICreate, ISolutionResponseWithCount, IUpdate, PageOptions, SearchOptions, Solution } from "../model/solution.model";

import validator from "../util/validator.util";
import { canModifyWithEditor, canView } from "../util/checkRole.util";

import InternalServerError from "../error/internalServer.error";
import BadRequestError from "../error/badRequest.error";

const createSchema = joi.object({
    title: joi.string().required(),
    contents: joi.string().required()
});

const updateSchema = joi.object({
    inquireId: joi.number(),
    title: joi.string(),
    contents: joi.string()
});

const router: Router = express.Router();
const solutionAdminService: SolutionAdminService = new SolutionAdminService();
const solutionImageAdminService: SolutionImageAdminService = new SolutionImageAdminService();
const inquireAdminService: InquireAdminService = new InquireAdminService();
const solutionAdminController: SolutionAdminController = new SolutionAdminController(solutionAdminService, solutionImageAdminService, inquireAdminService);

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: PageOptions = {
        count: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "r"
    };
    const searchOptions: SearchOptions = {
        userId: req.query.user_id ? Number(req.query.user_id) : undefined,
        username: req.query.name ? String(req.query.name) : undefined,
        title: req.query.title ? String(req.query.title) : undefined
    };
    const filterOptions: FilterOptions = {
        fromDate: req.query.from_date ? dayjs(String(req.query.from_date)).startOf("day").utc(true).toDate() : undefined,
        toDate: req.query.to_date ? dayjs(String(req.query.to_date)).endOf("day").utc(true).toDate() : undefined,
        hasImage: req.query.has_image ? boolean(req.query.has_image) : undefined
    };

    try {
        const results: ISolutionResponseWithCount = await solutionAdminController.getSolution(pageOptions, searchOptions, filterOptions);
        return res.status(STATUS_CODE.OK).json(results);
    } catch (error) {
        next(error);
    }
});

router.post("/:user_id/:inquire_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.user_id);
    const inquireId: number = Number(req.params.inquire_id);
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 10 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (isNaN(userId)) throw new BadRequestError(`User ID must be a number type | ${req.params.user_id}`);
            if (isNaN(inquireId)) throw new BadRequestError(`Inquire ID must be a number type | ${req.params.inquire_id}`);
            else if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);
            const { value, error }: ValidationResult = validator(req.body, createSchema);
            const data: ICreate = {
                title: value.title,
                contents: value.contents
            };
            let url: string = "";

            if (error) throw new BadRequestError(error.message);

            if (files.images) {
                url = await solutionAdminController.addSolutionWithImages(userId, inquireId, data, files.images);
            } else {
                url = await solutionAdminController.addSolution(inquireId, data);
            }

            res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.patch("/:user_id/:solution_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.user_id);
    const soltionId: number = Number(req.params.solution_id);
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 10 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (isNaN(userId)) throw new BadRequestError(`User ID must be a number type | ${req.params.user_id}`);
            if (isNaN(soltionId)) throw new BadRequestError(`Solution ID must be a number type | ${req.params.solution_id}`);
            else if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            req.body = Object.assign({}, req.body, fields);
            const { value, error }: ValidationResult = validator(req.body, updateSchema);
            const data: IUpdate = {
                inquireId: value.inquireId ? Number(value.inquireId) : undefined,
                title: value.title ? value.title : undefined,
                contents: value.contents ? value.contents : undefined
            };

            if (error) throw new BadRequestError(error.message);

            const updatedSolution: Solution = await solutionAdminController.updateSolution(userId, soltionId, data, files.images);
            res.status(STATUS_CODE.CREATED).json(updatedSolution);
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:solution_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const solutionIds: number[] = req.params.solution_ids.split(",").map(Number);
    const numSolutionIds: number[] = solutionIds.filter((solutionId: number) => {
        if (!isNaN(solutionId)) return solutionId;
    });

    try {
        if (!numSolutionIds || numSolutionIds.length <= 0) throw new BadRequestError("Calendar ID must be a number type");

        await solutionAdminController.deleteSolutions(numSolutionIds);
        res.status(STATUS_CODE.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
