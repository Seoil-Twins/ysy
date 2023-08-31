import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constant/statusCode.constant";

class UnauthorizedError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "UnauthorizedError";
        this.statusCode = STATUS_CODE.UNAUTHORIZED;
        this.errorCode = ERROR_CODE.UNAUTHORIZED;
    }
}

export default UnauthorizedError;
