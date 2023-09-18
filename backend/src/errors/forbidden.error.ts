import AbstractError from "./abstract.error.js";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant.js";

class ForbiddenError extends AbstractError {
  constructor(...args: any) {
    super(...args);
    this.name = "ForbiddenError";
    this.statusCode = STATUS_CODE.FORBIDDEN;
    this.errorCode = ERROR_CODE.FORBIDDEN;
  }
}

export default ForbiddenError;
