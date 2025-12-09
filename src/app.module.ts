import { Module } from "./core/module";
import { UserModule } from "./modules/user";

@Module({
  imports: [UserModule],
})
export class AppModule {}

