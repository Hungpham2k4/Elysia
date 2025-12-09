import { CreateUserDto, CreateUserInput, UpdateUserDto, UpdateUserInput } from "./user.dto";
import type { UserService } from "./user.service";
import { getLang } from "../../utils/lang";
import { translate } from "../../utils/translations";

export const UserController = (app: any) =>
  app
    .get(
      "/",
      async ({
        userService,
        request,
      }: {
        userService: UserService;
        request: Request;
      }) => {
        const lang = getLang(request.headers);
        const users = await userService.findAll(lang);
        
        return {
          message: translate("foundAll", lang),
          data: users,
          count: users.length
        };
      }
    )

    .get(
      "/:id",
      async ({
        userService,
        params,
        request,
      }: {
        userService: UserService;
        params: { id: string };
        request: Request;
      }) => {
        const lang = getLang(request.headers);
        const user = await userService.findById(params.id, lang);
        
        return {
          message: translate("found", lang),
          data: user
        };
      }
    )

    .post(
      "/",
      async ({
        userService,
        body,
        request,
      }: {
        userService: UserService;
        body: CreateUserInput;
        request: Request;
      }) => {
        const lang = getLang(request.headers);
        const user = await userService.create(body, lang);
        
        return {
          message: translate("created", lang),
          data: user
        };
      },
      { body: CreateUserDto }
    )

    .put(
      "/:id",
      async ({
        userService,
        params,
        body,
        request,
      }: {
        userService: UserService;
        params: { id: string };
        body: UpdateUserInput;
        request: Request;
      }) => {
        const lang = getLang(request.headers);
        const user = await userService.update(params.id, body, lang);
        
        return {
          message: translate("updated", lang),
          data: user
        };
      },
      { body: UpdateUserDto }
    );
