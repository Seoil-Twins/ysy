import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";
import formidable from "formidable";

import albumController from "../controller/album.controller";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";
import { Album, IResponse } from "../model/album.model";

const router: Router = express.Router();

const addSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    cupId: joi.string().required(),
    title: joi.string().required()
});

router.get("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");

        const albums: Album[] = await albumController.getAlbumsFolder(req.body.cupId);

        return res.status(StatusCode.OK).json(albums);
    } catch (_error) {
        next(_error);
    }
});

router.get("/:cup_id/:album_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const albumId = Number(req.params.album_id);

        if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");
        else if (isNaN(albumId)) throw new BadRequestError("Bad Request Error");

        const albums: IResponse = await albumController.getAlbums(req.body.cupId, albumId);

        return res.status(StatusCode.OK).json(albums);
    } catch (_error) {
        next(_error);
    }
});

router.post("/:cup_id", async (req: Request, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw new err();

            req.body = Object.assign({}, req.body, fields);

            const { value, error }: ValidationResult = validator(req.body, addSchema);

            if (error) throw new BadRequestError("Bad Request Error");
            else if (req.body.cupId !== req.params.cup_id) throw new ForbiddenError("Not Same Couple Id");

            if (Object.keys(files).length === 1) req.body.thumbnail = files.file;

            await albumController.addAlbumFolder(req.body);

            return res.status(StatusCode.CREATED).json({});
        } catch (_error) {
            next(_error);
        }
    });
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
        } catch (_error) {
            next(_error);
        }
    });
});

export default router;
