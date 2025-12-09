import { BaseError } from "./BaseError";

export class PermissionError extends BaseError {
  constructor(message = "Forbidden") {
    super(message, 403, "PERMISSION_DENIED");
  }
}
