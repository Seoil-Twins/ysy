import dayjs from "dayjs";
import joi, { ValidationResult } from "joi";
import express, { Router, Request, Response, NextFunction } from "express";
import formidable, { File } from "formidable";

import { IAlbumResponseWithCount, PageOptions, SearchOptions, FilterOptions, ICreate, IAdminUpdate } from "../model/album.model";

import albumAdminController from "../controller/album.admin.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";
import { canModifyWithEditor, canView } from "../util/checkRole";

import BadRequestError from "../error/badRequest";
import InternalServerError from "../error/internalServer";

const router: Router = express.Router();

const createSchema: joi.Schema = joi.object({
    cupId: joi.string().required(),
    title: joi.string().required()
});

const updateSchema: joi.Schema = joi.object({
    cupId: joi.string(),
    title: joi.string()
});

router.get("/", canView, async (req: Request, res: Response, next: NextFunction) => {
    const pageOptions: PageOptions = {
        count: Number(req.query.count) || 10,
        page: Number(req.query.page) || 1,
        sort: String(req.query.sort) || "r"
    };
    const searchOptions: SearchOptions = {
        cupId: req.query.cup_id ? String(req.query.cup_id) : undefined
    };
    const filterOptions: FilterOptions = {
        fromDate: req.query.from_date ? new Date(dayjs(String(req.query.from_date)).valueOf()) : undefined,
        toDate: req.query.to_date ? new Date(dayjs(String(req.query.to_date)).add(1, "day").valueOf()) : undefined
    };

    try {
        const result: IAlbumResponseWithCount = await albumAdminController.getAlbumFolders(pageOptions, searchOptions, filterOptions);

        logger.debug(`Response Data => ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/:cup_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: true, maxFieldsSize: 5 * 1024 * 1024, maxFiles: 101 });

    form.parse(req, async (err, fields, files) => {
        try {
            req.body = Object.assign({}, req.body, fields);
            req.body.cupId = req.params.cup_id ? String(req.params.cup_id) : undefined;
            const { error }: ValidationResult = validator(req.body, createSchema);

            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            else if (error) throw new BadRequestError(error.message);
            else if (files.thumbnail instanceof Array<formidable.File>) throw new BadRequestError("You must request only one thumbnail");

            const data: ICreate = {
                cupId: req.body.cupId,
                title: String(req.body.title)
            };
            const thumbnail: File | undefined = files.thumbnail;
            const images: File | File[] | undefined = files.images;

            await albumAdminController.createAlbum(data, thumbnail, images);

            res.status(StatusCode.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.post("/:cup_id/:album_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const cupId: string | undefined = req.params.cup_id ? String(req.params.cup_id) : undefined;
    const albumId: number | undefined = req.params.album_id ? Number(req.params.album_id) : undefined;
    const form = formidable({ multiples: true, maxFieldsSize: 5 * 1024 * 1024, maxFiles: 100 });

    form.parse(req, async (err, _fields, files) => {
        try {
            if (!cupId) throw new BadRequestError("You must be request couple ID");
            else if (!albumId) throw new BadRequestError("You must be request album ID");

            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            else if (!files.images) throw new BadRequestError("You must be request album images");

            await albumAdminController.addAlbumImages(cupId, albumId, files.images);

            res.status(StatusCode.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.patch("/:cup_id/:album_id", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const cupId: string | undefined = req.params.cup_id ? String(req.params.cup_id) : undefined;
    const albumId: number | undefined = req.params.album_id ? Number(req.params.album_id) : undefined;
    const form = formidable({ multiples: false, maxFieldsSize: 5 * 1024 * 1024, maxFiles: 100 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (!cupId) throw new BadRequestError("Required Couple Id");
            else if (!albumId) throw new BadRequestError("You must be request album ID");

            req.body = Object.assign({}, req.body, fields);
            req.body.cupId = req.params.cup_id ? String(req.params.cup_id) : undefined;
            const { error }: ValidationResult = validator(req.body, updateSchema);
            const thumbnail: File | File[] | undefined = files.thumbnail;
            const title: string | undefined = req.body.title ? String(req.body.title) : undefined;

            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            else if (error) throw new BadRequestError(error.message);
            else if (!thumbnail && !title) throw new BadRequestError("Request values is empty");
            else if (thumbnail instanceof Array<formidable.File>) throw new BadRequestError("You must request only one thumbnail");

            const data: IAdminUpdate = { title, albumId, cupId };
            await albumAdminController.updateAlbum(data, thumbnail);

            res.status(StatusCode.NO_CONTENT).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:album_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const albumIds: number[] = req.params.album_ids.split(",").map(Number);
    const numAlbumIds: number[] = albumIds.filter((albumId: number) => {
        if (!isNaN(albumId)) return albumId;
    });

    try {
        if (!numAlbumIds || numAlbumIds.length <= 0) throw new BadRequestError("Album ID must be a number type");

        await albumAdminController.deleteAlbums(numAlbumIds);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

router.delete("/image/:image_ids", canModifyWithEditor, async (req: Request, res: Response, next: NextFunction) => {
    const imageIds: number[] = req.params.image_ids.split(",").map(Number);
    const numImageIds: number[] = imageIds.filter((imageId: number) => {
        if (!isNaN(imageId)) return imageId;
    });

    try {
        if (!numImageIds || numImageIds.length <= 0) throw new BadRequestError("Album ID must be a number type");

        await albumAdminController.deleteAlbumImages(numImageIds);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
