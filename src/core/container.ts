import "reflect-metadata";
import { MetadataKeys } from "./decorators";
import type { ServiceDefinition, InjectionMetadata } from "./types";

type Token = string | Function;
type Factory<T = unknown> = () => T;

/**
 * DI Container - Quản lý tất cả dependencies
 */
export class Container {
  private services = new Map<Token, ServiceDefinition>();
  private instances = new Map<Token, unknown>();

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
  registerClass<T extends new (...args: unknown[]) => unknown>(Class: T): void {
    const metadata = Reflect.getMetadata(MetadataKeys.SERVICE, Class);
    if (!metadata) {
      throw new Error(`Class ${Class.name} is not decorated with @Service()`);
    }

    const token = Class.name;
    const injections: InjectionMetadata[] = Reflect.getMetadata(MetadataKeys.INJECT, Class) || [];
    
    const factory = (): InstanceType<T> => {
      // Resolve constructor dependencies
      const args = injections
        .sort((a, b) => a.index - b.index)
        .map((injection) => this.resolve(injection.token));

      return new Class(...args) as InstanceType<T>;
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

