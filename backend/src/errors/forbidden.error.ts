import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant";

class ForbiddenError extends AbstractError {
  constructor(...args: any) {
    super(...args);
    this.name = "ForbiddenError";
    this.statusCode = STATUS_CODE.FORBIDDEN;
    this.errorCode = ERROR_CODE.FORBIDDEN;
  }
}

export default ForbiddenError;
