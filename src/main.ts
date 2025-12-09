import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { errorHandler } from "./plugins/errorHandler";
import { UserService } from "./modules/user";
import { UserController } from "./modules/user";

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

  .listen(2912);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
