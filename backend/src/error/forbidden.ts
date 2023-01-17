import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode";

class ForbiddenError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "ForbiddenError";
        this.statusCode = StatusCode.FORBIDDEN;
    }
}

export default ForbiddenError;
