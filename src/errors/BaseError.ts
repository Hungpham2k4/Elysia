export class BaseError extends Error {
    status: number;
    code: string;
  
    constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
      super(message);
      this.status = status;
      this.code = code;
    }
  
    toResponse() {
      return Response.json(
        {
          error: this.code,
          message: this.message,
          timestamp: Date.now()
        },
        { status: this.status }
      );
    }
  }
  