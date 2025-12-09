import { BaseError } from "./BaseError";

export class AuthError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401, "AUTH_ERROR");
  }
}
