import dayjs from "dayjs";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable, { File } from "formidable";

import { canModifyWithEditor, canView } from "../util/checkRole.util";
import { STATUS_CODE } from "../constant/statusCode.constant";

import { FilterOptions, SolutionImageResponseWithCount, PageOptions, SearchOptions } from "../model/solutionImage.model";

import BadRequestError from "../error/badRequest.error";
import InternalServerError from "../error/internalServer.error";

import SolutionAdminService from "../service/solution.admin.service";
import SolutionImageAdminService from "../service/solutionImage.admin.service";
import InquireAdminService from "../service/inquire.admin.service";
import SolutionImageAdminController from "../controller/solutionImage.admin.controller";

const router: Router = express.Router();
const solutionService: SolutionAdminService = new SolutionAdminService();
const solutionImageAdminService: SolutionImageAdminService = new SolutionImageAdminService();
const inquireAdminService: InquireAdminService = new InquireAdminService();
const solutionImageAdminController: SolutionImageAdminController = new SolutionImageAdminController(
    solutionService,
    solutionImageAdminService,
    inquireAdminService
);

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: PageOptions = {
        count: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "r"
    };
    const searchOptions: SearchOptions = {
        solutionId: req.query.solution_id ? Number(req.query.solution_id) : undefined
    };
    const filterOptions: FilterOptions = {
        fromDate: req.query.from_date ? dayjs(String(req.query.from_date)).startOf("day").utc(true).toDate() : undefined,
        toDate: req.query.to_date ? dayjs(String(req.query.to_date)).endOf("day").utc(true).toDate() : undefined
    };

    try {
        const results: SolutionImageResponseWithCount = await solutionImageAdminController.getSolutionImages(pageOptions, searchOptions, filterOptions);
        return res.status(STATUS_CODE.OK).json(results);
    } catch (error) {
        next(error);
    }
});

router.post("/:solution_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const solutionId: number = Number(req.params.solution_id);
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 5 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (isNaN(solutionId)) throw new BadRequestError(`solution ID must be a number type | ${req.params.solution_id}`);
            else if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);

            const images: File | File[] | undefined = files.images;
            if (!images) throw new BadRequestError("You should give at least 1 image");

            const url: string = await solutionImageAdminController.addSolutionImages(solutionId, images);
            res.header({ Location: url }).status(STATUS_CODE.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:image_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const imageIds: number[] = req.params.image_ids.split(",").map(Number);
    const numSolutionIds: number[] = imageIds.filter((imageId: number) => {
        if (!isNaN(imageId)) return imageId;
    });

    try {
        if (!numSolutionIds || numSolutionIds.length <= 0) throw new BadRequestError("Inquire image ID must be a number type");

        await solutionImageAdminController.deleteSolutionImages(numSolutionIds);
        res.status(STATUS_CODE.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
