import { ValidationError } from "../errors";
import { getLang } from "./lang";
import { translate } from "./translations";
import type { Language } from "./translations";

/**
 * Custom validator cho email
 */
export function validateEmail(value: string | undefined, fieldName: string = "email", lang: Language = "vi"): string {
  if (!value || value.trim() === "") {
    const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    throw new ValidationError(
      { [fieldName]: translate("required", lang, { field: formattedFieldName }) },
      lang
    );
  }

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(
      { [fieldName]: translate("email", lang, { field: fieldName }) },
      lang
    );
  }

  return value;
}

/**
 * Custom validator cho password với minLength
 */
export function validatePassword(
  value: string | undefined,
  minLength: number = 6,
  fieldName: string = "password",
  lang: Language = "vi"
): string {
  if (!value || value.trim() === "") {
    const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    throw new ValidationError(
      { [fieldName]: translate("required", lang, { field: formattedFieldName }) },
      lang
    );
  }

  if (value.length < minLength) {
    throw new ValidationError(
      { [fieldName]: translate("minLength", lang, { field: fieldName, min: String(minLength) }) },
      lang
    );
  }

  return value;
}

/**
 * Custom validator cho string required
 */
export function validateRequired(
  value: string | undefined,
  fieldName: string,
  lang: Language = "vi"
): string {
  if (!value || value.trim() === "") {
    const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    throw new ValidationError(
      { [fieldName]: translate("required", lang, { field: formattedFieldName }) },
      lang
    );
  }

  return value;
}

/**
 * Custom validator cho optional string
 */
export function validateOptionalString(
  value: string | undefined,
  fieldName: string,
  lang: Language = "vi"
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
}

