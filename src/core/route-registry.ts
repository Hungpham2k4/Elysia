import { Elysia } from "elysia";
import { container } from "./container";
import type { IController } from "./types";
import "reflect-metadata";

export interface RouteConfig {
  path: string;
  controller: new (...args: any[]) => IController;
}

/**
 * Tự động register routes từ tất cả controllers đã được register
 */
export function registerRoutes<T extends Elysia>(app: T, routeConfigs: RouteConfig[]): T {
  routeConfigs.forEach((config) => {
    const controller = container.resolve<IController>(config.controller.name);
    // Type assertion để tránh type conflicts với Elysia's complex type system
    app.group(config.path, (group: any) => {
      const result = controller.registerRoutes(group as Elysia);
      return result;
    });
  });
  return app;
}

/**
 * Tự động discover và register routes từ module config
 */
export function autoRegisterRoutes(app: Elysia, moduleConfigs: Array<{ controllers?: unknown[]; routes?: RouteConfig[] }>): Elysia {
  const allRoutes: RouteConfig[] = [];

  moduleConfigs.forEach((config) => {
    if (config.routes) {
      allRoutes.push(...config.routes);
    }
  });

  return registerRoutes(app, allRoutes);
}

