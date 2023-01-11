import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode";

class InternalServerError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "InternalServerError";
        this.statusCode = StatusCode.INTERNAL_SERVER_ERROR;
    }
}

export default InternalServerError;
