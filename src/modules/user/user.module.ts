import { Module } from "../../core/module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

