import AbstractError from "./abstract.error.js";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant.js";

class UnauthorizedError extends AbstractError {
  constructor(...args: any) {
    super(...args);
    this.name = "UnauthorizedError";
    this.statusCode = STATUS_CODE.UNAUTHORIZED;
    this.errorCode = ERROR_CODE.UNAUTHORIZED;
  }
}

export default UnauthorizedError;
