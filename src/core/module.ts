import { Elysia } from "elysia";
import "reflect-metadata";
import { MetadataKeys } from "./decorators";
import { container } from "./container";
import type { IController, ElysiaGroup } from "./types";
import type { RouteConfig } from "./route-registry";

export interface ModuleConfig {
  controllers?: (new (...args: any[]) => IController)[];
  providers?: (new (...args: any[]) => any)[];
  imports?: (new () => any)[];
  routes?: RouteConfig[];
}

export interface RouteConfig {
  path: string;
  controller: new (...args: any[]) => IController;
}

/**
 * Decorator để đánh dấu class là Module
 */
export function Module(config: ModuleConfig) {
  return function <T extends new () => any>(target: T): T {
    // Register providers
    if (config.providers) {
      config.providers.forEach((Provider) => {
        container.registerClass(Provider);
      });
    }

    // Register controllers vào container
    if (config.controllers) {
      config.controllers.forEach((Controller) => {
        const metadata = Reflect.getMetadata(MetadataKeys.CONTROLLER, Controller);
        if (!metadata) {
          console.warn(`Class ${Controller.name} is not decorated with @Controller()`);
        }
        // Register controller với dependency injection
        const controllerInjections = Reflect.getMetadata(MetadataKeys.INJECT, Controller) || [];
        container.register(Controller.name, () => {
          const args = controllerInjections
            .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
            .map((injection: { token: string }) => container.resolve(injection.token));
          return new Controller(...args);
        });
      });
    }

    // Process imports
    if (config.imports) {
      config.imports.forEach((ImportedModule) => {
        const importedConfig: ModuleConfig = Reflect.getMetadata("module", ImportedModule) || {};
        // Recursively register imported module's providers and controllers
        if (importedConfig.providers) {
          importedConfig.providers.forEach((Provider) => {
            container.registerClass(Provider);
          });
        }
        if (importedConfig.controllers) {
          importedConfig.controllers.forEach((Controller) => {
            const controllerInjections = Reflect.getMetadata(MetadataKeys.INJECT, Controller) || [];
            container.register(Controller.name, () => {
              const args = controllerInjections
                .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
                .map((injection: { token: string }) => container.resolve(injection.token));
              return new Controller(...args);
            });
          });
        }
      });
    }

    // Store module config (bao gồm routes)
    Reflect.defineMetadata("module", config, target);
    return target;
  };
}

/**
 * Lấy tất cả routes từ modules đã import (recursive)
 */
export function getAllRoutesFromModules(modules: (new () => any)[]): RouteConfig[] {
  const allRoutes: RouteConfig[] = [];
  
  modules.forEach((ModuleClass) => {
    const config: ModuleConfig = Reflect.getMetadata("module", ModuleClass) || {};
    
    // Lấy routes từ module này
    if (config.routes) {
      allRoutes.push(...config.routes);
    }
    
    // Lấy routes từ imported modules (recursive)
    if (config.imports) {
      const importedRoutes = getAllRoutesFromModules(config.imports);
      allRoutes.push(...importedRoutes);
    }
  });
  
  return allRoutes;
}

/**
 * Tạo Elysia app từ module
 */
export function createAppFromModule(ModuleClass: any, baseApp?: Elysia): Elysia {
  const app = baseApp || new Elysia();
  const config: ModuleConfig = Reflect.getMetadata("module", ModuleClass) || {};

  // Register controllers và tạo routes
  if (config.controllers) {
    config.controllers.forEach((ControllerClass) => {
      const controller = new ControllerClass();
      
      // Get all methods của controller
      const prototype = ControllerClass.prototype;
      const methods = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== "constructor" && typeof prototype[name] === "function"
      );

      // Inject services vào controller
      const controllerWithServices: any = {};
      methods.forEach((methodName) => {
        controllerWithServices[methodName] = async (ctx: any) => {
          // Resolve services từ container và inject vào method
          const method = prototype[methodName];
          return method.call(controller, ctx);
        };
      });

      // Nếu controller có method registerRoutes, gọi nó
      if (typeof controller.registerRoutes === "function") {
        controller.registerRoutes(app, container);
      }
    });
  }

  return app;
}

