import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant";

class UnsupportedMediaTypeError extends AbstractError {
  constructor(...args: any) {
    super(...args);
    this.name = "UnsupportedMediaTypeError";
    this.statusCode = STATUS_CODE.UNSUPPORTED_MEDIA_TYPE;
    this.errorCode = ERROR_CODE.UNSUPPORTED_MEDIA_TYPE;
  }
}

export default UnsupportedMediaTypeError;
