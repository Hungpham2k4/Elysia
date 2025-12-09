import { BaseError } from "./BaseError";

export class DatabaseError extends BaseError {
  constructor(message = "Database error") {
    super(message, 500, "DATABASE_ERROR");
  }
}
