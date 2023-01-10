import AbstractError from "./abstractError";
import StatusCode from "../util/statusCode";

class UnauthorizedError extends AbstractError {
    constructor(...args: any) {
        super(...args);
        this.name = "UnauthorizedError";
        this.statusCode = StatusCode.UNAUTHORIZED;
    }
}

export default UnauthorizedError;
