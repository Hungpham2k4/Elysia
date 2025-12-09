import { Elysia } from "elysia";
import "reflect-metadata";
import { MetadataKeys } from "./decorators";
import { container } from "./container";

export interface ModuleConfig {
  controllers?: any[];
  providers?: any[];
  imports?: any[];
}

/**
 * Decorator để đánh dấu class là Module
 */
export function Module(config: ModuleConfig) {
  return function (target: any) {
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
        // Register controller instance
        container.register(Controller.name, () => new Controller());
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
            container.register(Controller.name, () => new Controller());
          });
        }
      });
    }

    // Store module config
    Reflect.defineMetadata("module", config, target);
    return target;
  };
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

