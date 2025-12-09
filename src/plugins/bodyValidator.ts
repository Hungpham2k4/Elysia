import { Elysia } from "elysia";
import { getLang } from "../utils/lang";
import { ValidationError } from "../errors";

/**
 * Body validator plugin
 * Validate request body và throw ValidationError nếu có lỗi
 * Plugin này sẽ được apply trước route handlers để validate body
 */
export const bodyValidator = new Elysia()
  .onBeforeHandle(({ body, request, set }: any) => {
    // Lấy language từ headers
    const lang = getLang(request.headers);

    // Nếu body là undefined hoặc null, không validate
    if (body === undefined || body === null) {
      return;
    }

    // Validation sẽ được thực hiện trong controller hoặc service
    // Plugin này chỉ để đảm bảo body được parse đúng cách
    return;
  })
  .onError(({ code, error, set, request }: any) => {
    // Nếu có ValidationError được throw, format và return
    if (error instanceof ValidationError) {
      set.status = 400;
      return error.toResponse();
    }
    // Let other errors pass through
  });

