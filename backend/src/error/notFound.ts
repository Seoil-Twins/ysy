import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode";

class NotFoundError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "NotFoundError";
        this.statusCode = StatusCode.NOT_FOUND;
    }
}

export default NotFoundError;
