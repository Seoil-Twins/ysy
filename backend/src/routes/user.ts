import express, { Router, Request, Response, NextFunction } from "express";
import joi, { ValidationResult } from "joi";

import validator from "../util/validator";
import StatusCode from "../util/statusCode";

import userController from "../controller/user";

import BadRequestError from "../error/badRequest";

const router: Router = express.Router();

const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,15}$/;
const phonePattern = /^[0-9]+$/;
const signupSchema: joi.Schema = joi.object({
    sns_id: joi.string().length(4).required(),
    name: joi.string().trim().required(),
    password: joi.string().trim().min(8).max(15).regex(RegExp(pwPattern)).required(),
    email: joi.string().trim().email().required(),
    phone: joi.string().trim().length(11).regex(RegExp(phonePattern)).required(),
    birthday: joi
        .date()
        .greater(new Date("1980-01-01")) // 1980-01-01보다 더 큰 날짜여야 함.
        .less(new Date("2023-12-31")) // 2023-12-31보다 낮은 날짜여야 함.
        .required(),
    event_nofi: joi.bool().default(false)
});

// Get User Info
router.get("/", (req: Request, res: Response) => {
    res.send("Get User");
});

// Signup User
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const { value, error }: ValidationResult = validator(req.body, signupSchema);
    
    try {
        if (error) throw new BadRequestError("Bad Request Error");
        await userController.createUser(value);

        return res.status(StatusCode.CREATED).json({});
    } catch (_error) {
        next(_error);
    }
});

// Update User Info
router.put("/", (req: Request, res: Response) => {
    res.send("Update!");
});

// Delete User Info
router.delete("/", (req: Request, res: Response) => {
    res.send("Delete!");
});

export default router;
