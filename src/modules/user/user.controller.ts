import { CreateUserDto, CreateUserInput, UpdateUserDto, UpdateUserInput } from "./user.dto";
import { UserService } from "./user.service";
import { getLang } from "../../utils/lang";
import { translate } from "../../utils/translations";
import { Controller, Inject } from "../../core/decorators";
import type { IController } from "../../core/types";
import { Elysia } from "elysia";
import { validateEmail, validatePassword, validateRequired, validateOptionalString } from "../../utils/validators";

@Controller()
export class UserController implements IController {
  constructor(
    @Inject(UserService) private readonly userService: UserService
  ) {}

  registerRoutes(app: Elysia): Elysia {
    const result = app
      .get(
        "/",
        async ({ request }: { request: Request }) => {
          const lang = getLang(request.headers);
          const users = await this.userService.findAll(lang);
          
          return {
            message: translate("foundAll", lang),
            data: users,
            count: users.length
          };
        }
      )

      .get(
        "/:id",
        async ({ params, request }: { params: { id: string }; request: Request }) => {
          const lang = getLang(request.headers);
          const user = await this.userService.findById(params.id, lang);
          
          return {
            message: translate("found", lang),
            data: user
          };
        }
      )

      .post(
        "/",
        async ({ body, request }: { body: any; request: Request }) => {
          const lang = getLang(request.headers);
          
          // Custom validation - throw ValidationError nếu có lỗi
          const validatedBody: CreateUserInput = {
            email: validateEmail(body?.email, "email", lang),
            name: validateOptionalString(body?.name, "name", lang),
            password: validatePassword(body?.password, 6, "password", lang)
          };
          
          const user = await this.userService.create(validatedBody, lang);
          
          return {
            message: translate("created", lang),
            data: user
          };
        }
        // Bỏ { body: CreateUserDto } để không dùng Elysia validation
        // Chỉ dùng custom validators
      )

      .put(
        "/:id",
        async ({ params, body, request }: { params: { id: string }; body: any; request: Request }) => {
          const lang = getLang(request.headers);
          
          // Custom validation cho update (tất cả fields đều optional)
          const validatedBody: UpdateUserInput = {};
          if (body?.email !== undefined) {
            validatedBody.email = validateEmail(body.email, "email", lang);
          }
          if (body?.name !== undefined) {
            validatedBody.name = validateOptionalString(body.name, "name", lang);
          }
          if (body?.password !== undefined) {
            validatedBody.password = validatePassword(body.password, 6, "password", lang);
          }
          
          const user = await this.userService.update(params.id, validatedBody, lang);
          
          return {
            message: translate("updated", lang),
            data: user
          };
        }
        // Bỏ { body: UpdateUserDto } để không dùng Elysia validation
        // Chỉ dùng custom validators
      );
    
    return result as unknown as Elysia;
  }
}
