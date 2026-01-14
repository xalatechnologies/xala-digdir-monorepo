/**
 * Lightweight Dependency Injection Container
 * NestJS-like DI pattern using reflection metadata
 */
import 'reflect-metadata';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = any> = new (...args: any[]) => T;
type Factory<T = unknown> = () => T;

interface Provider<T = unknown> {
  token: string | symbol;
  useClass?: Constructor<T>;
  useFactory?: Factory<T>;
  useValue?: T;
  singleton?: boolean;
}

class Container {
  private providers = new Map<string | symbol, Provider>();
  private instances = new Map<string | symbol, unknown>();
  private resolving = new Set<string | symbol>();

  /**
   * Register a provider with the container
   */
  register<T>(token: string | symbol, provider: Omit<Provider<T>, 'token'>): this {
    this.providers.set(token, { token, ...provider } as Provider);
    return this;
  }

  /**
   * Register a class as a singleton
   */
  registerSingleton<T>(token: string | symbol, constructor: Constructor<T>): this {
    return this.register(token, { useClass: constructor, singleton: true });
  }

  /**
   * Register a class as transient (new instance each time)
   */
  registerTransient<T>(token: string | symbol, constructor: Constructor<T>): this {
    return this.register(token, { useClass: constructor, singleton: false });
  }

  /**
   * Register a constant value
   */
  registerValue<T>(token: string | symbol, value: T): this {
    return this.register(token, { useValue: value, singleton: true });
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(token: string | symbol, factory: Factory<T>, singleton = true): this {
    return this.register(token, { useFactory: factory, singleton });
  }

  /**
   * Resolve a dependency from the container
   */
  resolve<T>(token: string | symbol): T {
    // Check for circular dependency
    if (this.resolving.has(token)) {
      throw new Error(`Circular dependency detected for token: ${String(token)}`);
    }

    const provider = this.providers.get(token);
    if (!provider) {
      throw new Error(`No provider found for token: ${String(token)}`);
    }

    // Return cached singleton if available
    if (provider.singleton && this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    this.resolving.add(token);

    try {
      let instance: T;

      if (provider.useValue !== undefined) {
        instance = provider.useValue as T;
      } else if (provider.useFactory) {
        instance = provider.useFactory() as T;
      } else if (provider.useClass) {
        instance = this.createInstance(provider.useClass) as T;
      } else {
        throw new Error(`Invalid provider configuration for token: ${String(token)}`);
      }

      // Cache singleton
      if (provider.singleton) {
        this.instances.set(token, instance);
      }

      return instance;
    } finally {
      this.resolving.delete(token);
    }
  }

  /**
   * Create an instance of a class, resolving constructor dependencies
   */
  private createInstance<T>(constructor: Constructor<T>): T {
    const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const injectionTokens = Reflect.getMetadata('inject:tokens', constructor) || [];

    const dependencies = paramTypes.map((type: Constructor, index: number) => {
      // Check for explicit @Inject token
      const explicitToken = injectionTokens[index];
      if (explicitToken) {
        return this.resolve(explicitToken);
      }

      // Use type name as token
      const tokenName = type?.name;
      if (tokenName && this.providers.has(tokenName)) {
        return this.resolve(tokenName);
      }

      // Try to instantiate the type directly if it's injectable
      if (type && Reflect.getMetadata('injectable', type)) {
        return this.createInstance(type);
      }

      throw new Error(
        `Cannot resolve dependency at index ${index} for ${constructor.name}. ` +
        `Make sure it's registered or decorated with @Injectable()`
      );
    });

    return new constructor(...dependencies);
  }

  /**
   * Check if a token is registered
   */
  has(token: string | symbol): boolean {
    return this.providers.has(token);
  }

  /**
   * Clear all registrations and cached instances
   */
  clear(): void {
    this.providers.clear();
    this.instances.clear();
    this.resolving.clear();
  }

  /**
   * Get all registered tokens
   */
  getTokens(): (string | symbol)[] {
    return Array.from(this.providers.keys());
  }
}

// Global container instance
export const container = new Container();

// Export types
export type { Constructor, Factory, Provider };
export { Container };
