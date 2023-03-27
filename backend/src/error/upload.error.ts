import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constant/statusCode.constant";

class UploadError extends AbstractError {
    paths: string[] = [];

    constructor(paths: string[], ...args: any) {
        super(...args);
        this.name = "FirebaseUploadError";
        this.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
        this.errorCode = ERROR_CODE.FAILED_UPLOAD;
        this.paths = paths;
    }
}

export default UploadError;
