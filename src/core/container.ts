import "reflect-metadata";
import { MetadataKeys } from "./decorators";

type Token = string | Function;
type Factory<T = any> = () => T;

interface ServiceDefinition {
  token: Token;
  factory: Factory;
  instance?: any;
  scope: "singleton" | "transient";
}

/**
 * DI Container - Quản lý tất cả dependencies
 */
export class Container {
  private services = new Map<Token, ServiceDefinition>();
  private instances = new Map<Token, any>();

  /**
   * Register một service vào container
   */
  register<T>(
    token: Token,
    factory: Factory<T>,
    options?: { scope?: "singleton" | "transient" }
  ): void {
    this.services.set(token, {
      token,
      factory,
      scope: options?.scope || "singleton",
    });
  }

  /**
   * Register một class (tự động detect dependencies)
   */
  registerClass<T extends new (...args: any[]) => any>(Class: T): void {
    const metadata = Reflect.getMetadata(MetadataKeys.SERVICE, Class);
    if (!metadata) {
      throw new Error(`Class ${Class.name} is not decorated with @Service()`);
    }

    const token = Class.name;
    const injections = Reflect.getMetadata(MetadataKeys.INJECT, Class) || [];
    
    const factory = () => {
      // Resolve constructor dependencies
      const args = injections
        .sort((a: any, b: any) => a.index - b.index)
        .map((injection: any) => this.resolve(injection.token));

      return new Class(...args);
    };

    this.register(token, factory, { scope: metadata.scope });
  }

  /**
   * Resolve một dependency
   */
  resolve<T>(token: Token): T {
    // Check if already resolved (singleton)
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    const definition = this.services.get(token);
    if (!definition) {
      throw new Error(`Service ${typeof token === "string" ? token : token.name} not found in container`);
    }

    const instance = definition.factory();

    // Cache singleton instances
    if (definition.scope === "singleton") {
      this.instances.set(token, instance);
    }

    return instance;
  }

  /**
   * Get tất cả services đã register
   */
  getServices(): Map<Token, ServiceDefinition> {
    return this.services;
  }

  /**
   * Clear container
   */
  clear(): void {
    this.services.clear();
    this.instances.clear();
  }
}

// Global container instance
export const container = new Container();

