import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable, { File } from "formidable";

import AlbumController from "../controller/album.controller";

import logger from "../logger/logger";
import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import InternalServerError from "../error/internalServer";

import { Album, ICreate, IRequestGet, IRequestUpadteThumbnail, IRequestUpadteTitle, IResponse } from "../model/album.model";
import AlbumService from "../service/album.service";
import AlbumImageService from "../service/albumImage.service";

const router: Router = express.Router();
const albumService = new AlbumService();
const albumImageService = new AlbumImageService();
const albumController = new AlbumController(albumService, albumImageService);

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

        const data: ICreate = {
            cupId: value.cupId,
            title: value.title
        };
        const album: Album = await albumController.addAlbumFolder(data);

        return res.status(StatusCode.CREATED).json(album);
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

            if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("You don't same token couple ID and path parameter couple ID");
            else if (isNaN(albumId)) throw new BadRequestError("Album ID must be a number type");
            else if (!files.images) throw new BadRequestError("You must request images");

            const url: string = await albumController.addImages(req.body.cupId, albumId, files.images);

            return res.header({ Location: url }).status(StatusCode.CREATED).json({});
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

        const data: IRequestUpadteTitle = {
            albumId: albumId,
            cupId: req.body.cupId,
            title: value.title
        };

        const album: Album = await albumController.updateTitle(data);

        return res.status(StatusCode.NO_CONTENT).json(album);
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
            else if (!files.thumbnail) new BadRequestError("You must request only one thumbnail");
            else if (files.thumbnail instanceof Array<formidable.File>) throw new BadRequestError("You must request only one thumbnail");

            const data: IRequestUpadteThumbnail = {
                albumId: albumId,
                cupId: req.body.cupId
            };
            const thumbnail: File = files.thumbnail;
            const album: Album = await albumController.updateThumbnail(data, thumbnail);

            return res.status(StatusCode.NO_CONTENT).json(album);
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
