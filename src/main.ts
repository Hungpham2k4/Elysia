import "reflect-metadata";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { errorHandler } from "./plugins/errorHandler";
import { AppModule } from "./app.module";
import { UserController } from "./modules/user";
import { container } from "./core/container";

// Initialize AppModule (this will register all providers and controllers)
const appModule = new AppModule();

// Create base app
const app = new Elysia()
  .use(cors())
  .use(errorHandler);

// Register routes from UserController
const userController = container.resolve<UserController>("UserController");
app.group("/users", (group: any) => userController.registerRoutes(group));

app.listen(2912);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
