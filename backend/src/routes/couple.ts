import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import coupleController from "../controller/couple.controller";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import BadRequestError from "../error/badRequest";
import ForbiddenError from "../error/forbidden";

const router: Router = express.Router();

const signupSchema: joi.Schema = joi.object({
    userId: joi.number().required(),
    userId2: joi.number().required(),
    title: joi.string().required(),
    thumbnail: joi.string().required(),
    cupDay: joi.date().required()
});

// const updateSchema: joi.Schema = joi.object({
//     userId: joi.number().required(),
//     name: joi.string().max(8).trim(),
//     profile: joi.string().trim(),
//     primaryNofi: joi.boolean(),
//     dateNofi: joi.boolean(),
//     eventNofi: joi.boolean()
// });

// const deleteSchema: joi.Schema = joi.object({
//     userId: joi.number().required()
// });

// Get Couple Info
router.get("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    // const userId: string = req.params.user_id;
    // try {
    //     if (isNaN(Number(userId))) throw new BadRequestError("Invalid User Id");
    //     const user: User = await userController.getUser(userId);
    //     return res.status(StatusCode.OK).json(user);
    // } catch (_error) {
    //     next(_error);
    // }
});

// Signup Couple
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, signupSchema);

    try {
        console.log(error);
        if (error) throw new BadRequestError("Bad Request Error");
        await coupleController.createCouple(value);

        return res.status(StatusCode.CREATED).json({});
    } catch (_error) {
        next(_error);
    }
});

// Update Couple Info
router.patch("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    // const { value, error }: ValidationResult = validator(req.body, updateSchema);
    // try {
    //     if (req.params.user_id != req.body.userId) throw new ForbiddenError("Forbidden Error");
    //     else if (error) throw new BadRequestError("Bad Request Error");
    //     else if (value.name && value.name.length <= 1) throw new BadRequestError("Bad Request Error");
    //     await userController.updateUser(value);
    //     return res.status(204).json({});
    // } catch (_error) {
    //     next(_error);
    // }
});

// Delete Couple
router.delete("/:user_id", async (req: Request, res: Response, next: NextFunction) => {
    // const { value, error }: ValidationResult = validator(req.body, deleteSchema);
    // try {
    //     return res.status(204).json({});
    // } catch (_error) {
    //     next(_error);
    // }
});

export default router;
