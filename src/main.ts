import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { errorHandler } from "./plugins/errorHandler";
import { UserService } from "./modules/user";
import { UserController } from "./modules/user";
import { ValidationError } from "./errors";
import { getLang } from "./utils/lang";
import { translate } from "./utils/translations";

const userService = new UserService();

const app = new Elysia()
  .use(cors())
  .use(errorHandler)

  .derive(() => ({
    userService
  }))

  .group("/users", (group) => 
    UserController(group)
  )

  .onError(({ code, error, status, set, request }) => {
    console.log("App-level error handler called:", { code, error, status });
    
    // Lấy language từ headers
    const lang = getLang(request.headers);
    
    // Nếu là validation error và chưa được xử lý
    if (code === "VALIDATION") {
      const fields: Record<string, string> = {};
      
      if (error && typeof error === "object") {
        const errorAny = error as any;
        
        // Xử lý error.all array
        if (Array.isArray(errorAny.all)) {
          for (const err of errorAny.all) {
            if (err && typeof err === "object") {
              const errObj = err as any;
              let path = errObj.path || errObj.field || errObj.key || "unknown";
              
              // Loại bỏ dấu "/" ở đầu path nếu có
              if (typeof path === "string" && path.startsWith("/")) {
                path = path.substring(1);
              }
              
              // Xác định loại lỗi và translate
              let translatedMessage = errObj.message || String(err);
              const fieldName = String(path);
              
              // Detect required error: "Expected string" hoặc type === "required"
              if (errObj.type === "required" || 
                  (typeof translatedMessage === "string" && 
                   (translatedMessage.includes("Expected") || 
                    translatedMessage.includes("required") ||
                    translatedMessage === "Expected string"))) {
                // Format field name: "email" -> "Email"
                const formattedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                translatedMessage = translate("required", lang, { field: formattedFieldName });
              } else if (errObj.type === "format" && fieldName === "email") {
                translatedMessage = translate("email", lang, { field: fieldName });
              } else if (errObj.type === "minLength") {
                const min = errObj.min || errObj.minLength || "";
                translatedMessage = translate("minLength", lang, { field: fieldName, min });
              }
              
              fields[fieldName] = translatedMessage;
            }
          }
        } else if (errorAny.message) {
          // Parse từ message
          const message = String(errorAny.message);
          if (message.includes("email") || message.toLowerCase().includes("email")) {
            fields.email = translate("email", lang, { field: "email" });
          } else if (message.includes("password") || message.toLowerCase().includes("password")) {
            fields.password = message;
          } else {
            fields._general = message;
          }
        }
      }
      
      set.status = 400;
      return new ValidationError(Object.keys(fields).length > 0 ? fields : undefined, lang).toResponse();
    }
    
    // Các lỗi khác sẽ được xử lý bởi errorHandler plugin
    return;
  })

  .listen(2912);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
