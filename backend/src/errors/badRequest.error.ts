import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant";

class BadRequestError extends AbstractError {
  constructor(...args: any) {
    super(...args);
    this.name = "BadRequestError";
    this.statusCode = STATUS_CODE.BAD_REQUEST;
    this.errorCode = ERROR_CODE.BAD_REQUEST;
  }
}

export default BadRequestError;
