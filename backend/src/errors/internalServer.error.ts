import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant";

class InternalServerError extends AbstractError {
  constructor(...args: any) {
    super(...args);
    this.name = "InternalServerError";
    this.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
    this.errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR;
  }
}

export default InternalServerError;
