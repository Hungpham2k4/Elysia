import { Elysia } from "elysia";
import { ValidationError } from "../errors";
import { getLang } from "../utils/lang";
import { translate } from "../utils/translations";

/**
 * Helper function để format validation errors
 */
export function formatValidationError(error: any, lang: "en" | "vi" = "vi"): Response {
  const fields: Record<string, string> = {};
  
  // Xử lý trường hợp error là string (như "Mật khẩu ≥ 6 ký tự")
  if (typeof error === "string") {
    const errorStr = error;
    const errorLower = errorStr.toLowerCase();
    if (errorLower.includes("password") || errorLower.includes("mật khẩu")) {
      fields.password = errorStr;
    } else if (errorLower.includes("email")) {
      fields.email = errorStr;
    } else if (errorLower.includes("name") || errorLower.includes("tên")) {
      fields.name = errorStr;
    } else {
      fields._general = errorStr;
    }
  }
  // Xử lý error object
  else if (error && typeof error === "object") {
    // Elysia validation error có thể có cấu trúc khác nhau
    if ("all" in error && Array.isArray(error.all)) {
      // Xử lý error.all array
      for (const err of error.all) {
        if (err && typeof err === "object") {
          const errAny = err as any;
          
          // Lấy field name từ path
          let path = errAny.path || errAny.field || errAny.key || errAny.schema || "unknown";
          
          // Loại bỏ dấu "/" ở đầu path nếu có
          if (typeof path === "string" && path.startsWith("/")) {
            path = path.substring(1);
          }
          
          // Nếu path là array, lấy phần tử cuối (field name)
          if (Array.isArray(path)) {
            path = path[path.length - 1] || "unknown";
          }
          
          const fieldName = String(path);
          
          // Lấy message từ error
          let errorMessage = errAny.message || errAny.error || String(err);
          
          // Kiểm tra xem message có phải là từ DTO error property không
          const isCustomMessage = typeof errorMessage === "string" && 
            (errorMessage.includes("không") || 
             errorMessage.includes("≥") || 
             errorMessage.includes("phải") ||
             errorMessage.includes("hợp lệ"));
          
          // Nếu là custom message từ DTO, giữ nguyên
          if (isCustomMessage) {
            // Message đã được translate trong DTO, giữ nguyên
          }
          // Detect required error
          else if (errAny.type === "required" || 
              (typeof errorMessage === "string" && 
               (errorMessage.includes("Expected") || 
                errorMessage.includes("required") ||
                errorMessage === "Expected string"))) {
            const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            errorMessage = translate("required", lang, { field: formattedFieldName });
          } 
          // Detect format error (email)
          else if (errAny.type === "format" || 
                   (fieldName === "email" && (errorMessage.includes("format") || errorMessage.includes("email")))) {
            errorMessage = translate("email", lang, { field: fieldName });
          } 
          // Detect minLength error
          else if (errAny.type === "minLength" || 
                   (typeof errorMessage === "string" && 
                    (errorMessage.includes("minLength") || errorMessage.includes("minimum")))) {
            const min = errAny.min || errAny.minLength || errAny.value || "";
            errorMessage = translate("minLength", lang, { field: fieldName, min });
          }
          
          fields[fieldName] = errorMessage;
        }
      }
    } 
    // Xử lý trường hợp error là object với message trực tiếp
    else if ("message" in error) {
      const errorAny = error as any;
      const message = String(errorAny.message);
      
      // Thử extract field name từ path nếu có
      if (errorAny.path) {
        let path = errorAny.path;
        if (typeof path === "string" && path.startsWith("/")) {
          path = path.substring(1);
        }
        if (Array.isArray(path)) {
          path = path[path.length - 1] || "unknown";
        }
        const fieldName = String(path);
        fields[fieldName] = message;
      } 
      // Thử extract từ message
      else if (message.includes("email") || message.toLowerCase().includes("email")) {
        fields.email = message.includes("email") && !message.includes("required") 
          ? message 
          : translate("email", lang, { field: "email" });
      } else if (message.includes("password") || message.toLowerCase().includes("password")) {
        fields.password = message;
      } else {
        fields._general = message;
      }
    }
    
    // Xử lý trường hợp error có type và path trực tiếp
    const errorAny = error as any;
    if ("type" in errorAny && "path" in errorAny && Object.keys(fields).length === 0) {
      let path = errorAny.path;
      if (typeof path === "string" && path.startsWith("/")) {
        path = path.substring(1);
      }
      if (Array.isArray(path)) {
        path = path[path.length - 1] || "unknown";
      }
      const fieldName = String(path);
      const message = errorAny.message || errorAny.error || translate("invalid", lang);
      fields[fieldName] = message;
    }
  }
  
  return new ValidationError(Object.keys(fields).length > 0 ? fields : undefined, lang).toResponse();
}

/**
 * Validation error handler plugin
 * Bắt validation errors từ Elysia schema và format theo custom format
 */
export const validationHandler = new Elysia()
  .onError(({ code, error, status, set, request }: any) => {
    // Chỉ xử lý validation errors
    const statusCode = typeof status === "function" ? undefined : status;
    
    console.log("Validation handler called:", { code, statusCode, errorType: typeof error, error, errorString: String(error) });
    
    // Elysia validation errors có thể có code "VALIDATION" hoặc status 422
    if (code === "VALIDATION" || statusCode === 422) {
      const lang = getLang(request.headers);
      set.status = 400;
      const response = formatValidationError(error, lang);
      // Return response để override default Elysia validation error
      console.log("Validation handler returning response:", response);
      return response;
    }
    // Let other errors pass through
  })
  // Thử dùng onBeforeHandle để intercept validation errors
  .onBeforeHandle(({ request, set }: any) => {
    // Log để debug
    console.log("onBeforeHandle called for:", request.url);
  });

