import { CreateUserDto, CreateUserInput, UpdateUserDto, UpdateUserInput } from "./user.dto";
import { UserService } from "./user.service";
import { getLang } from "../../utils/lang";
import { translate } from "../../utils/translations";
import { Controller, Inject } from "../../core/decorators";
import type { IController } from "../../core/types";
import { Elysia } from "elysia";

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
        async ({ body, request }: { body: CreateUserInput; request: Request }) => {
          const lang = getLang(request.headers);
          const user = await this.userService.create(body, lang);
          
          return {
            message: translate("created", lang),
            data: user
          };
        },
        { body: CreateUserDto }
      )

      .put(
        "/:id",
        async ({ params, body, request }: { params: { id: string }; body: UpdateUserInput; request: Request }) => {
          const lang = getLang(request.headers);
          const user = await this.userService.update(params.id, body, lang);
          
          return {
            message: translate("updated", lang),
            data: user
          };
        },
        { body: UpdateUserDto }
      );
    
    return result as unknown as Elysia;
  }
}
