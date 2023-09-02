/**
 * package.json
 * "build": "tsc && npm run copy-files"
 * "copy-files": "cp -r src/public/ dist/public/ && cp -r src/views/ dist/views/",
 * ts 파일만 빌드하기 때문에 ts가 아닌 파일들을 복사해서 dist에다가 넣어줘야 함.
 */

import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import dayjs, { PluginFunc } from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import routes from "./routes/index";

import errorHandlerMiddleware from "./middlewares/errorHandler.middleware";
import morganMiddleware from "./middlewares/morgan.middleware";

import association from "./models/association.config";

import logger from "./logger/logger";

dotenv.config();
association.config();

dayjs.locale("ko");
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

// Dayjs 인터페이스 확장
declare module "dayjs" {
  interface Dayjs {
    formattedHour(): string;
    formattedDate(): string;
  }
}
const formattedPlugin: PluginFunc = (_, dayjsClass) => {
  dayjsClass.prototype.formattedDate = function () {
    return this.format("YYYY-MM-DD");
  };
  dayjsClass.prototype.formattedHour = function () {
    return this.format("YYYY-MM-DD HH:mm:ss");
  };
};
dayjs.extend(formattedPlugin);

const app: Application = express();
const port = 3000;
const boolParser = require("express-query-boolean");

app.use(express.json());
app.use(boolParser());
app.use(express.urlencoded({ extended: false }));
app.use(morganMiddleware);
app.all("*", (request: Request, _response: Response, next: NextFunction) => {
  logger.debug(`Request Body Data : ${JSON.stringify(request.body)}`);
  logger.debug(`Request Params Data : ${JSON.stringify(request.params)}`);

  next();
});

app.use("/", routes);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.debug(`Server Listen on port : ${port}!`);
});

export const API_ROOT = process.env.API_ROOT || `http://localhost:${port}`;
