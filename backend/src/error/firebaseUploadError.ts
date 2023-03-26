import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode";

class UploadError extends AbstractError {
    paths: string[] = [];

    constructor(paths: string[], ...args: any) {
        super(...args);
        this.name = "FirebaseStorageUploadError";
        this.statusCode = StatusCode.INTERNAL_SERVER_ERROR;
        this.paths = paths;
    }
}

export default UploadError;
