import "reflect-metadata";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { errorHandler } from "./plugins/errorHandler";
import { AppModule } from "./app.module";
import { getAllRoutesFromModules } from "./core/module";
import { registerRoutes } from "./core/route-registry";

// Initialize AppModule (this will register all providers and controllers)
const appModule = new AppModule();

// Create base app
const app = new Elysia()
  .use(cors())
  .use(errorHandler);

// Auto-register routes from AppModule (tự động lấy từ imports)
const routes = getAllRoutesFromModules([AppModule]);
registerRoutes(app as any, routes);

app.listen(2912);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
