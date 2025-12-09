import { Module, type RouteConfig } from "../../core/module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { registerTranslations } from "../../utils/translations";
import { userTranslations } from "./translations";

// Register user module translations
registerTranslations("user", userTranslations);

@Module({
  providers: [UserService],
  controllers: [UserController],
  routes: [
    {
      path: "/users",
      controller: UserController,
    },
  ],
})
export class UserModule {}

