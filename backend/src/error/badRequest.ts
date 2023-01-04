import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode"

class BadRequestError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "BadRequestError";
        this.statusCode = StatusCode.BAD_REQUEST;
    }
}

export default BadRequestError;
