import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode"

class ConflictError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "ConflictError";
        this.statusCode = StatusCode.CONFLICT;
    }
}

export default ConflictError;
