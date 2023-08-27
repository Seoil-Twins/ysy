import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constant/statusCode.constant";

class NotFoundError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "NotFoundError";
        this.statusCode = STATUS_CODE.NOT_FOUND;
        this.errorCode = ERROR_CODE.NOT_FOUND;
    }
}

export default NotFoundError;
