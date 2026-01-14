/**
 * Decorators for Dependency Injection
 * NestJS-compatible decorator patterns
 */
import 'reflect-metadata';
import { container, type Constructor } from './container';

/**
 * @Injectable() - Mark a class as injectable
 * Can optionally specify a custom token
 */
export function Injectable(options?: { token?: string | symbol; singleton?: boolean }): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('injectable', true, target);
    
    // Auto-register with container
    const token = options?.token || target.name;
    const singleton = options?.singleton ?? true;
    
    if (singleton) {
      container.registerSingleton(token, target as Constructor);
    } else {
      container.registerTransient(token, target as Constructor);
    }
  };
}

/**
 * @Inject() - Inject a dependency by token
 * Used when auto-resolution isn't possible
 */
export function Inject(token: string | symbol): ParameterDecorator {
  return function (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = Reflect.getMetadata('inject:tokens', target) || [];
    existingTokens[parameterIndex] = token;
    Reflect.defineMetadata('inject:tokens', existingTokens, target);
  };
}

/**
 * @Module() - Define a module with imports, providers, controllers
 */
export interface ModuleOptions {
  imports?: Constructor[];
  providers?: Constructor[];
  controllers?: Constructor[];
  exports?: (string | symbol | Constructor)[];
}

export function Module(options: ModuleOptions): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('module:options', options, target);
    Reflect.defineMetadata('module', true, target);
  };
}

/**
 * @Controller() - Mark a class as a REST controller
 */
export function Controller(prefix: string = ''): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('controller', true, target);
    Reflect.defineMetadata('controller:prefix', prefix, target);
    Reflect.defineMetadata('injectable', true, target);
    container.registerSingleton(target.name, target as Constructor);
  };
}

/**
 * Route decorators
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RouteMetadata {
  method: HttpMethod;
  path: string;
  handler: string;
}

function createRouteDecorator(method: HttpMethod) {
  return function (path: string = ''): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
      const routes: RouteMetadata[] = Reflect.getMetadata('controller:routes', target.constructor) || [];
      routes.push({
        method,
        path,
        handler: String(propertyKey),
      });
      Reflect.defineMetadata('controller:routes', routes, target.constructor);
      return descriptor;
    };
  };
}

export const Get = createRouteDecorator('GET');
export const Post = createRouteDecorator('POST');
export const Put = createRouteDecorator('PUT');
export const Patch = createRouteDecorator('PATCH');
export const Delete = createRouteDecorator('DELETE');

/**
 * @Resolver() - Mark a class as a GraphQL resolver
 */
export function Resolver(typeName?: string): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata('resolver', true, target);
    Reflect.defineMetadata('resolver:type', typeName || target.name.replace('Resolver', ''), target);
    Reflect.defineMetadata('injectable', true, target);
    container.registerSingleton(target.name, target as Constructor);
  };
}

/**
 * GraphQL field decorators
 */
export function Query(name?: string): MethodDecorator {
  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const queries = Reflect.getMetadata('resolver:queries', target.constructor) || [];
    queries.push({ name: name || String(propertyKey), handler: String(propertyKey) });
    Reflect.defineMetadata('resolver:queries', queries, target.constructor);
    return descriptor;
  };
}

export function Mutation(name?: string): MethodDecorator {
  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const mutations = Reflect.getMetadata('resolver:mutations', target.constructor) || [];
    mutations.push({ name: name || String(propertyKey), handler: String(propertyKey) });
    Reflect.defineMetadata('resolver:mutations', mutations, target.constructor);
    return descriptor;
  };
}

/**
 * Get controller metadata
 */
export function getControllerMetadata(controller: Constructor): {
  prefix: string;
  routes: RouteMetadata[];
} {
  return {
    prefix: Reflect.getMetadata('controller:prefix', controller) || '',
    routes: Reflect.getMetadata('controller:routes', controller) || [],
  };
}

/**
 * Get module metadata
 */
export function getModuleMetadata(module: Constructor): ModuleOptions {
  return Reflect.getMetadata('module:options', module) || {};
}
