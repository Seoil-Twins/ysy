import morgan from "morgan";
import dotenv from "dotenv";
import logger from "../logger/logger";
import { Request, Response } from "express";
import moment from "moment-timezone";

dotenv.config();

const format = () => {
    const result = process.env.NODE_ENV === "production" ? "combined" : "dev";
    return result;
};

const stream = {
    write: (message: any) => {
        logger.info(message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ""));
    }
};

const skip = (_: Request, res: Response) => {
    if (process.env.NODE_ENV === "production") return res.statusCode < 400;
    return false;
};

const date = (_req: Request, _res: Response) => {
    return moment().tz("Asia/Seoul").format();
};

morgan.token("date", date);

const morganMiddleware = morgan(format(), { stream, skip });

export default morganMiddleware;
