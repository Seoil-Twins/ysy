import AbstractError from "./abstract.error";
import { STATUS_CODE, ERROR_CODE } from "../constants/statusCode.constant";
import { DeleteImageInfo } from "../utils/gcp.util";

class UploadError extends AbstractError {
  errors: DeleteImageInfo[] = [];

  constructor(errors: DeleteImageInfo[], ...args: any) {
    super(...args);
    this.name = "GCPUploadError";
    this.statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR;
    this.errorCode = ERROR_CODE.FAILED_UPLOAD;
    this.errors = errors;
  }
}

export default UploadError;
