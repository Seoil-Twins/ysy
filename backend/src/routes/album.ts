import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import albumController from "../controller/album.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import { Album, IRequestGet, IResponse } from "../model/album.model";

const router: Router = express.Router();

const titleSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    cupId: joi.string().required(),
    title: joi.string().required()
});

router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");

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
        let count = Number(req.query.count);
        const nextPageToken = req.query.nextPageToken ? String(req.query.nextPageToken) : undefined;

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");
        else if (isNaN(albumId)) throw new BadRequestError("Bad Request Error");
        else if (isNaN(count)) count = 50;

        const data: IRequestGet = {
            albumId: albumId,
            cupId: req.body.cupId,
            count: count,
            nextPageToken: nextPageToken
        };
        const result: IResponse = await albumController.getAlbums(data);

        logger.debug(`Response Data : ${JSON.stringify(result)}`);
        return res.status(StatusCode.OK).json(result);
    } catch (error) {
        next(error);
    }
});

router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });

    try {
        const { value, error }: ValidationResult = validator(req.body, titleSchema);

        if (error) throw new BadRequestError("Bad Request Error");
        else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");

        await albumController.addAlbumFolder(req.body);

        return res.status(StatusCode.CREATED).json({});
    } catch (error) {
        next(error);
    }
});

router.post("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new err();
            const albumId = Number(req.params.album_id);

            req.body = Object.assign({}, req.body);

            if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");
            else if (isNaN(albumId)) throw new BadRequestError("Bad Request Error");
            else if (Object.keys(files).length <= 0) throw new BadRequestError("Bad Request Error");

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
        if (error) throw new BadRequestError("Bad Request Error");

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");
        else if (isNaN(albumId)) throw new BadRequestError("Bad Request Error");

        req.body.albumId = albumId;
        await albumController.updateTitle(req.body);

        return res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

router.patch("/:cup_id/:album_id/thumbnail", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new err();
            const albumId = Number(req.params.album_id);

            if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");
            else if (isNaN(albumId)) throw new BadRequestError("Bad Request Error");

            if (Object.keys(files).length === 1) req.body.thumbnail = files.file;
            else throw new BadRequestError("Bad Request Error");

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

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");
        else if (isNaN(albumId)) throw new BadRequestError("Bad Request Error");

        await albumController.deleteAlbum(req.body.cupId, albumId);

        return res.status(StatusCode.NO_CONTENT).json({});
    } catch (error) {
        next(error);
    }
});

export default router;
