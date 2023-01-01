/**
 * package.json
 * "build": "tsc && npm run copy-files"
 * "copy-files": "cp -r src/public/ dist/public/ && cp -r src/views/ dist/views/",
 * ts 파일만 빌드하기 때문에 ts가 아닌 파일들을 복사해서 dist에다가 넣어줘야 함.
 */

import express, { Application } from "express";
import routes from "./routes/index";

const app: Application = express();
const port = 3000;

app.use("/", routes);

app.listen(port, () => {
    console.log("Server Listen on port : 3000!");
});
