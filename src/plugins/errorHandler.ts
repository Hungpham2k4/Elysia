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

/**
 * Error handler plugin
 * Xử lý tất cả errors trong ứng dụng, bao gồm:
 * - Custom errors (ValidationError, NotFoundError, etc.)
 * - Prisma errors
 * - Internal errors
 */

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

    // 1️⃣ Custom errors (bao gồm ValidationError từ custom validators)
    if (error instanceof BaseError) {
      return error.toResponse();
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
