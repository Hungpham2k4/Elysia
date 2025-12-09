// Metadata keys
const SERVICE_METADATA = Symbol("service");
const CONTROLLER_METADATA = Symbol("controller");
const INJECT_METADATA = Symbol("inject");

/**
 * Decorator để đánh dấu class là Service
 * @param options - Options cho service (optional)
 */
export function Service(options?: { scope?: "singleton" | "transient" }) {
  return function <T extends new (...args: any[]) => any>(target: T): T {
    Reflect.defineMetadata(SERVICE_METADATA, {
      scope: options?.scope || "singleton",
      token: target.name,
    }, target);
    return target;
  };
}

/**
 * Decorator để đánh dấu class là Controller
 */
export function Controller() {
  return function <T extends new (...args: any[]) => any>(target: T): T {
    Reflect.defineMetadata(CONTROLLER_METADATA, true, target);
    return target;
  };
}

/**
 * Decorator để inject dependency vào constructor parameter
 * @param token - Token của dependency cần inject
 */
export function Inject(token: string | Function) {
  return function (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ): void {
    const existingInjections = Reflect.getMetadata(INJECT_METADATA, target) || [];
    existingInjections.push({
      index: parameterIndex,
      token: typeof token === "function" ? token.name : token,
    });
    Reflect.defineMetadata(INJECT_METADATA, existingInjections, target);
  };
}

// Export metadata keys for internal use
export const MetadataKeys = {
  SERVICE: SERVICE_METADATA,
  CONTROLLER: CONTROLLER_METADATA,
  INJECT: INJECT_METADATA,
};

