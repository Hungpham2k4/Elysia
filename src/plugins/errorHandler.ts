import { Elysia } from "elysia";
import {
  BaseError,
  AuthError,
  PermissionError,
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../errors";
import { getLang } from "../utils/lang";
import { translate } from "../utils/translations";

export const errorHandler = new Elysia()
  .error({
    BaseError,
    AuthError,
    PermissionError,
    NotFoundError,
    ValidationError,
    DatabaseError,
  })
  .onError(({ code, error, status, set, request }) => {
    const isProd = process.env.NODE_ENV === "production";
    
    // Lấy language từ headers
    const lang = getLang(request.headers);

    // Debug: Log error để kiểm tra
    console.log("Error handler called:", { code, error, status, errorType: typeof error, errorKeys: error && typeof error === "object" ? Object.keys(error) : [] });

    // 1️⃣ Custom errors
    if (error instanceof BaseError) {
      return error.toResponse();
    }

    // 2️⃣ Validation errors từ Elysia schema
    if (code === "VALIDATION") {
      // Format validation errors từ Elysia
      const fields: Record<string, string> = {};
      
      if (error && typeof error === "object") {
        // Elysia validation error có thể có cấu trúc khác nhau
        if ("all" in error && Array.isArray(error.all)) {
          // Xử lý error.all array
          for (const err of error.all) {
            if (err && typeof err === "object") {
              // Elysia validation error có thể có path hoặc field
              const errAny = err as any;
              let path = errAny.path || errAny.field || errAny.key || "unknown";
              
              // Loại bỏ dấu "/" ở đầu path nếu có
              if (typeof path === "string" && path.startsWith("/")) {
                path = path.substring(1);
              }
              
              // Xác định loại lỗi và translate
              let translatedMessage = errAny.message || String(err);
              const fieldName = String(path);
              
              // Detect required error: "Expected string" hoặc type === "required"
              if (errAny.type === "required" || 
                  (typeof translatedMessage === "string" && 
                   (translatedMessage.includes("Expected") || 
                    translatedMessage.includes("required") ||
                    translatedMessage === "Expected string"))) {
                // Format field name: "email" -> "Email"
                const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                translatedMessage = translate("required", lang, { field: formattedFieldName });
              } else if (errAny.type === "format" && fieldName === "email") {
                translatedMessage = translate("email", lang, { field: fieldName });
              } else if (errAny.type === "minLength") {
                const min = errAny.min || errAny.minLength || "";
                translatedMessage = translate("minLength", lang, { field: fieldName, min });
              }
              
              fields[fieldName] = translatedMessage;
            }
          }
        } else if ("message" in error) {
          // Nếu chỉ có message, thử parse hoặc dùng message chung
          const message = String((error as any).message);
          // Thử extract field name từ message nếu có thể
          if (message.includes("email") || message.toLowerCase().includes("email")) {
            fields.email = translate("email", lang, { field: "email" });
          } else if (message.includes("password") || message.toLowerCase().includes("password")) {
            fields.password = message;
          } else {
            fields._general = message;
          }
        }
        
        // Thử parse từ type nếu có
        const errorAny = error as any;
        if ("type" in errorAny && "path" in errorAny) {
          const path = String(errorAny.path);
          const message = errorAny.message ? String(errorAny.message) : translate("invalid", lang);
          fields[path] = message;
        }
      }
      
      // Đảm bảo set status code đúng
      set.status = 400;
      
      return new ValidationError(Object.keys(fields).length > 0 ? fields : undefined, lang).toResponse();
    }

    // 3️⃣ Prisma errors (nếu chưa được bắt trong service)
    if (error && typeof error === "object" && "code" in error) {
      // Prisma unique constraint error (P2002)
      if (error.code === "P2002") {
        const field = (error as any).meta?.target?.[0] || "field";
        return new ValidationError({
          [field]: translate("userExists", lang)
        }, lang).toResponse();
      }
      // Other Prisma errors
      if (String(error.code).startsWith("P")) {
        return new DatabaseError(
          isProd ? "Database error" : (error as Error).message
        ).toResponse();
      }
    }

    // 4️⃣ Route không tồn tại
    if (code === "NOT_FOUND") {
      return new NotFoundError().toResponse();
    }

    // 5️⃣ Lỗi khác → Internal error
    console.error("Unhandled error:", error);

    return Response.json(
      {
        error: "INTERNAL_ERROR",
        message: isProd ? "Internal server error" : error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  });
