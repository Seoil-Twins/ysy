import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constant/statusCode.constant";

class ConflictError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "ConflictError";
        this.statusCode = STATUS_CODE.CONFLICT;
        this.errorCode = ERROR_CODE.CONFLICT;
    }
}

export default ConflictError;
