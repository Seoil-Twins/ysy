import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import albumController from "../controller/album.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";

import { Album, IRequestGet, IResponse } from "../model/album.model";

const router: Router = express.Router();

const titleSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    cupId: joi.string().required(),
    title: joi.string().required()
});

router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

        const results: Album[] = await albumController.getAlbumsFolder(req.body.cupId);

        logger.debug(`Response Data : ${JSON.stringify(results)}`);
        return res.status(StatusCode.OK).json(results);
    } catch (error) {
        next(error);
    }
});

router.get("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const albumId = Number(req.params.album_id);
        const page = !isNaN(Number(req.query.page)) ? Number(req.query.page) : 1;
        const count = !isNaN(Number(req.query.count)) ? Number(req.query.count) : 50;

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

        const data: IRequestGet = {
            albumId: albumId,
            cupId: req.body.cupId,
            page: page,
            count: count
        };
        const result: IResponse = await albumController.getAlbums(data);

        logger.debug(`Response Data : ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { value, error }: ValidationResult = validator(req.body, titleSchema);

        if (error) throw new BadRequestError(error.message);
        else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");

        await albumController.addAlbumFolder(req.body);

        return res.status(StatusCode.CREATED).json({});
    } catch (error) {
        next(error);
    }
});

router.post("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024, maxFiles: 100 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            const albumId = Number(req.params.album_id);

            req.body = Object.assign({}, req.body);

            if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
            else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");
            else if (Object.keys(files).length <= 0) throw new BadRequestError("You must request only one thumbnail");

            await albumController.addAlbums(req.body.cupId, albumId, files.file);

            return res.status(StatusCode.CREATED).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.patch("/:cup_id/:album_id/title", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const albumId = Number(req.params.album_id);
        const { value, error }: ValidationResult = validator(req.body, titleSchema);
        if (error) throw new BadRequestError(error.message);

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

        req.body.albumId = albumId;
        await albumController.updateTitle(req.body);

        return res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

router.patch("/:cup_id/:album_id/thumbnail", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new InternalServerError(`Image Server Error : ${JSON.stringify(err)}`);
            const albumId = Number(req.params.album_id);

            if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
            else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

            if (Object.keys(files).length === 1) req.body.thumbnail = files.file;
            else throw new BadRequestError("You must request only one thumbnail");

            req.body.albumId = albumId;
            await albumController.updateThumbnail(req.body);

            return res.status(StatusCode.NO_CONTENT).json({});
        } catch (error) {
            next(error);
        }
    });
});

router.delete("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const albumId = Number(req.params.album_id);

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");

        await albumController.deleteAlbum(req.body.cupId, albumId);

        return res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

router.delete("/:cup_id/:album_id/image/:image_ids", async (req: Request, res: Response, next: NextFunction) => {
    const imageIds: number[] = req.params.image_ids.split(",").map(Number);
    const numImageIds: number[] = imageIds.filter((imageId: number) => {
        if (!isNaN(imageId)) return imageId;
    });

    try {
        const albumId = Number(req.params.album_id);
        const cupId: string | undefined = req.body.cupId;

        if (!numImageIds || numImageIds.length <= 0) throw new BadRequestError("No album ids");
        else if (!cupId) throw new ForbiddenError("You don't have couple ID in request body");
        else if (cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
        else if (isNaN(albumId)) throw new BadRequestError("Album Id must be a number type");

        await albumController.deleteAlbumImages(cupId, albumId, numImageIds);
        res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
