import { Module, type RouteConfig } from "../../core/module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

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

