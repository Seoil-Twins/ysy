import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant";
import { Image } from "../utils/firebase.util";

class UploadError extends AbstractError {
  errors: Image[] = [];

  constructor(errors: Image[], ...args: any) {
    super(...args);
    this.name = "FirebaseUploadError";
    this.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
    this.errorCode = ERROR_CODE.FAILED_UPLOAD;
    this.errors = errors;
  }
}

export default UploadError;
