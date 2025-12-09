import { Elysia } from "elysia";

/**
 * Type cho Elysia group context
 */
export type ElysiaGroup = Elysia<any, any, any, any, any, any, any>;

/**
 * Type cho controller với registerRoutes method
 */
export interface IController {
  registerRoutes(app: Elysia): Elysia;
}

/**
 * Type cho service definition
 */
export interface ServiceDefinition<T = unknown> {
  token: string | Function;
  factory: () => T;
  instance?: T;
  scope: "singleton" | "transient";
}

/**
 * Type cho injection metadata
 */
export interface InjectionMetadata {
  index: number;
  token: string;
}

/**
 * Type cho route metadata
 */
export interface RouteMetadata {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}

