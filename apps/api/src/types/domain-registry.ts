/**
 * Domain Registry Types
 *
 * Local type definitions for the domain registration system.
 * These replace imports from the deleted @xalatechnologies/platform/config package.
 */

export interface DomainApp {
  id: string;
  name: string;
  port: number;
  routes: string[];
  description: string;
  requiresAuth: boolean;
}

export interface RouteConfig {
  path: string;
  requiredPermissions: string[];
  requiredFeatures: string[];
  description: string;
  app: string;
  isPublic?: boolean;
}

export interface NavPolicy {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiredPermissions: string[];
  requiredFeatures?: string[];
  section: string;
  app: string;
  order: number;
  parentId?: string;
}

export interface DomainIntegration {
  id: string;
  name: string;
  type: 'authentication' | 'payment' | 'notification' | 'calendar' | 'storage';
  required: boolean;
}

export interface DomainMetadata {
  region: string;
  compliance: string[];
  supportedLanguages: string[];
  primaryLanguage: string;
  timezone: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  apps: DomainApp[];
  features: string[];
  routes: RouteConfig[];
  navPolicies: NavPolicy[];
  integrations: DomainIntegration[];
  metadata: DomainMetadata;
}

/**
 * Simple domain registry implementation
 */
class DomainRegistryImpl {
  private domains: Map<string, DomainConfig> = new Map();

  register(config: DomainConfig): void {
    this.domains.set(config.id, config);
  }

  unregister(id: string): boolean {
    return this.domains.delete(id);
  }

  has(id: string): boolean {
    return this.domains.has(id);
  }

  get(id: string): DomainConfig | undefined {
    return this.domains.get(id);
  }

  getAll(): DomainConfig[] {
    return Array.from(this.domains.values());
  }
}

export const domainRegistry = new DomainRegistryImpl();
