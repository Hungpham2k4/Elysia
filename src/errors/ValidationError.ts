import { BaseError } from "./BaseError";
import { translate, type Language } from "../utils/translations";

export class ValidationError extends BaseError {
  fields: any;
  lang: Language;

  constructor(fields: any, lang: Language = "vi") {
    const message = translate("invalid", lang);
    super(message, 400, "VALIDATION_ERROR");
    this.fields = fields;
    this.lang = lang;
  }

  toResponse() {
    return Response.json(
      {
        error: this.code,
        message: this.message,
        fields: this.fields,
        timestamp: Date.now()
      },
      { status: this.status }
    );
  }
}
