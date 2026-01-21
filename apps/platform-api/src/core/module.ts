/**
 * Module System
 * NestJS-like module orchestration
 */
import 'reflect-metadata';
import { container, type Constructor } from './container';
import { getModuleMetadata } from './decorators';

export interface ModuleDefinition {
  imports?: Constructor[];
  providers?: Constructor[];
  controllers?: Constructor[];
  exports?: (string | symbol | Constructor)[];
}

/**
 * Module loader - bootstraps modules in correct order
 */
export class ModuleLoader {
  private loadedModules = new Set<Constructor>();

  /**
   * Load a module and all its dependencies
   */
  async load(moduleClass: Constructor): Promise<void> {
    if (this.loadedModules.has(moduleClass)) {
      return;
    }

    const metadata = getModuleMetadata(moduleClass);

    // Load imported modules first
    if (metadata.imports) {
      for (const importedModule of metadata.imports) {
        await this.load(importedModule);
      }
    }

    // Register providers
    if (metadata.providers) {
      for (const provider of metadata.providers) {
        if (!container.has(provider.name)) {
          container.registerSingleton(provider.name, provider);
        }
      }
    }

    // Register controllers
    if (metadata.controllers) {
      for (const controller of metadata.controllers) {
        if (!container.has(controller.name)) {
          container.registerSingleton(controller.name, controller);
        }
      }
    }

    this.loadedModules.add(moduleClass);
  }

  /**
   * Get all loaded controllers
   */
  getControllers(): Constructor[] {
    const controllers: Constructor[] = [];

    for (const module of this.loadedModules) {
      const metadata = getModuleMetadata(module);
      if (metadata.controllers) {
        controllers.push(...metadata.controllers);
      }
    }

    return controllers;
  }

  /**
   * Get all loaded modules
   */
  getModules(): Constructor[] {
    return Array.from(this.loadedModules);
  }
}

export const moduleLoader = new ModuleLoader();
