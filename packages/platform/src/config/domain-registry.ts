/**
 * Domain Registry
 *
 * The Domain Registry allows multiple domain applications (like Digilist)
 * to register themselves with the Xala platform. This enables:
 *
 * - Multi-domain SaaS architecture
 * - Centralized route policy management
 * - Navigation policy enforcement
 * - Feature flag management per domain
 *
 * @example
 * ```typescript
 * // Domain registration (e.g., in apps/api/src/domain-registration.ts)
 * import { domainRegistry } from '@xalatechnologies/platform/config';
 *
 * domainRegistry.register({
 *   id: 'digilist',
 *   name: 'Digilist Booking Platform',
 *   description: 'Municipal rental and booking system',
 *   version: '1.0.0',
 *   apps: [...],
 *   features: ['bookings', 'seasons'],
 *   routes: [...],
 *   navPolicies: [...],
 * });
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * App configuration within a domain
 */
export interface DomainApp {
  /** Unique app identifier within the domain */
  id: string;

  /** Human-readable app name */
  name: string;

  /** Development server port */
  port: number;

  /** Routes this app handles (e.g., ['/', '/listings']) */
  routes: string[];

  /** Optional description */
  description?: string;

  /** Whether app requires authentication */
  requiresAuth?: boolean;
}

/**
 * Route configuration with permission and feature requirements
 */
export interface RouteConfig {
  /** Route path (supports wildcards, e.g., '/admin/*') */
  path: string;

  /** Required permissions to access this route */
  requiredPermissions: string[];

  /** Required features (from entitlements) to access this route */
  requiredFeatures: string[];

  /** Route description for documentation */
  description?: string;

  /** App this route belongs to */
  app?: string;

  /** Whether route is public (no auth required) */
  isPublic?: boolean;
}

/**
 * Navigation policy for sidebar/menu items
 */
export interface NavPolicy {
  /** Unique navigation item identifier */
  id: string;

  /** Display label (or i18n key) */
  label: string;

  /** Icon identifier (e.g., 'dashboard', 'settings') */
  icon?: string;

  /** Route this nav item links to */
  route: string;

  /** Required permissions to show this nav item */
  requiredPermissions: string[];

  /** Required features to show this nav item */
  requiredFeatures?: string[];

  /** Parent nav item ID for nested menus */
  parentId?: string;

  /** Section grouping (e.g., 'main', 'settings', 'admin') */
  section?: string;

  /** Display order within section */
  order?: number;

  /** App this nav item belongs to */
  app?: string;
}

/**
 * Integration configuration for third-party services
 */
export interface DomainIntegration {
  /** Integration identifier */
  id: string;

  /** Integration name */
  name: string;

  /** Integration type (e.g., 'payment', 'notification', 'analytics') */
  type: string;

  /** Whether integration is required */
  required?: boolean;

  /** Configuration schema (JSON Schema) */
  configSchema?: Record<string, unknown>;
}

/**
 * Complete domain configuration
 */
export interface DomainConfig {
  /** Unique domain identifier (e.g., 'digilist', 'crm', 'helpdesk') */
  id: string;

  /** Human-readable domain name */
  name: string;

  /** Domain description */
  description: string;

  /** Semantic version (e.g., '1.0.0') */
  version: string;

  /** Apps within this domain */
  apps: DomainApp[];

  /** Feature identifiers this domain provides */
  features: string[];

  /** Route configurations */
  routes: RouteConfig[];

  /** Navigation policies */
  navPolicies: NavPolicy[];

  /** Available integrations */
  integrations?: DomainIntegration[];

  /** Domain-specific metadata */
  metadata?: Record<string, unknown>;

  /** Registered timestamp (set automatically) */
  registeredAt?: Date;
}

/**
 * Domain registry event types
 */
export type DomainRegistryEventType = 'register' | 'unregister' | 'update';

/**
 * Domain registry event
 */
export interface DomainRegistryEvent {
  type: DomainRegistryEventType;
  domainId: string;
  config?: DomainConfig;
  timestamp: Date;
}

/**
 * Domain registry event listener
 */
export type DomainRegistryListener = (event: DomainRegistryEvent) => void;

// ============================================================================
// Domain Registry Interface
// ============================================================================

/**
 * Domain Registry interface for managing domain configurations
 */
export interface DomainRegistry {
  /**
   * Register a new domain with the platform
   *
   * @param config - Complete domain configuration
   * @throws Error if domain with same ID is already registered
   *
   * @example
   * ```typescript
   * domainRegistry.register({
   *   id: 'digilist',
   *   name: 'Digilist Booking Platform',
   *   // ...
   * });
   * ```
   */
  register(config: DomainConfig): void;

  /**
   * Unregister a domain from the platform
   *
   * @param domainId - Domain identifier to unregister
   * @returns true if domain was unregistered, false if not found
   */
  unregister(domainId: string): boolean;

  /**
   * Get a domain configuration by ID
   *
   * @param domainId - Domain identifier
   * @returns Domain configuration or undefined if not found
   */
  get(domainId: string): DomainConfig | undefined;

  /**
   * List all registered domains
   *
   * @returns Array of all domain configurations
   */
  list(): DomainConfig[];

  /**
   * Check if a domain is registered
   *
   * @param domainId - Domain identifier
   * @returns true if domain is registered
   */
  has(domainId: string): boolean;

  /**
   * Get all routes for a specific domain
   *
   * @param domainId - Domain identifier
   * @returns Array of route configurations, empty if domain not found
   */
  getRoutes(domainId: string): RouteConfig[];

  /**
   * Get all navigation policies for a specific domain
   *
   * @param domainId - Domain identifier
   * @returns Array of navigation policies, empty if domain not found
   */
  getNavPolicies(domainId: string): NavPolicy[];

  /**
   * Get all navigation policies for a specific app within a domain
   *
   * @param domainId - Domain identifier
   * @param appId - App identifier within the domain
   * @returns Array of navigation policies for the app
   */
  getNavPoliciesForApp(domainId: string, appId: string): NavPolicy[];

  /**
   * Get routes for a specific app within a domain
   *
   * @param domainId - Domain identifier
   * @param appId - App identifier within the domain
   * @returns Array of route configurations for the app
   */
  getRoutesForApp(domainId: string, appId: string): RouteConfig[];

  /**
   * Get all features across all registered domains
   *
   * @returns Array of unique feature identifiers
   */
  getAllFeatures(): string[];

  /**
   * Get all apps across all registered domains
   *
   * @returns Array of app configurations with domain context
   */
  getAllApps(): Array<DomainApp & { domainId: string }>;

  /**
   * Find domains that provide a specific feature
   *
   * @param feature - Feature identifier
   * @returns Array of domains that provide the feature
   */
  findByFeature(feature: string): DomainConfig[];

  /**
   * Subscribe to registry events
   *
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  subscribe(listener: DomainRegistryListener): () => void;

  /**
   * Update an existing domain configuration
   *
   * @param domainId - Domain identifier
   * @param updates - Partial configuration updates
   * @throws Error if domain is not registered
   */
  update(domainId: string, updates: Partial<Omit<DomainConfig, 'id'>>): void;

  /**
   * Clear all registered domains (useful for testing)
   */
  clear(): void;
}

// ============================================================================
// Domain Registry Implementation
// ============================================================================

/**
 * Creates a new domain registry instance
 */
function createDomainRegistry(): DomainRegistry {
  // Internal storage
  const domains = new Map<string, DomainConfig>();
  const listeners = new Set<DomainRegistryListener>();

  // Emit event to all listeners
  function emitEvent(event: DomainRegistryEvent): void {
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[DomainRegistry] Listener error:', error);
      }
    });
  }

  return {
    register(config: DomainConfig): void {
      if (domains.has(config.id)) {
        throw new Error(
          `Domain "${config.id}" is already registered. ` +
          `Use update() to modify an existing domain or unregister() first.`
        );
      }

      // Validate required fields
      if (!config.id || !config.name || !config.version) {
        throw new Error(
          'Domain configuration must include id, name, and version.'
        );
      }

      // Add registration timestamp
      const registeredConfig: DomainConfig = {
        ...config,
        registeredAt: new Date(),
      };

      domains.set(config.id, registeredConfig);

      emitEvent({
        type: 'register',
        domainId: config.id,
        config: registeredConfig,
        timestamp: new Date(),
      });

      console.log(`[DomainRegistry] Registered domain: ${config.id} (${config.name} v${config.version})`);
    },

    unregister(domainId: string): boolean {
      const existed = domains.has(domainId);
      if (existed) {
        domains.delete(domainId);
        emitEvent({
          type: 'unregister',
          domainId,
          timestamp: new Date(),
        });
        console.log(`[DomainRegistry] Unregistered domain: ${domainId}`);
      }
      return existed;
    },

    get(domainId: string): DomainConfig | undefined {
      return domains.get(domainId);
    },

    list(): DomainConfig[] {
      return Array.from(domains.values());
    },

    has(domainId: string): boolean {
      return domains.has(domainId);
    },

    getRoutes(domainId: string): RouteConfig[] {
      const domain = domains.get(domainId);
      return domain?.routes ?? [];
    },

    getNavPolicies(domainId: string): NavPolicy[] {
      const domain = domains.get(domainId);
      return domain?.navPolicies ?? [];
    },

    getNavPoliciesForApp(domainId: string, appId: string): NavPolicy[] {
      const domain = domains.get(domainId);
      if (!domain) return [];
      return domain.navPolicies.filter((policy) => policy.app === appId);
    },

    getRoutesForApp(domainId: string, appId: string): RouteConfig[] {
      const domain = domains.get(domainId);
      if (!domain) return [];
      return domain.routes.filter((route) => route.app === appId);
    },

    getAllFeatures(): string[] {
      const features = new Set<string>();
      domains.forEach((domain) => {
        domain.features.forEach((feature) => features.add(feature));
      });
      return Array.from(features);
    },

    getAllApps(): Array<DomainApp & { domainId: string }> {
      const apps: Array<DomainApp & { domainId: string }> = [];
      domains.forEach((domain) => {
        domain.apps.forEach((app) => {
          apps.push({ ...app, domainId: domain.id });
        });
      });
      return apps;
    },

    findByFeature(feature: string): DomainConfig[] {
      return Array.from(domains.values()).filter((domain) =>
        domain.features.includes(feature)
      );
    },

    subscribe(listener: DomainRegistryListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    update(domainId: string, updates: Partial<Omit<DomainConfig, 'id'>>): void {
      const existing = domains.get(domainId);
      if (!existing) {
        throw new Error(
          `Domain "${domainId}" is not registered. Use register() first.`
        );
      }

      const updatedConfig: DomainConfig = {
        ...existing,
        ...updates,
        id: domainId, // Ensure ID cannot be changed
      };

      domains.set(domainId, updatedConfig);

      emitEvent({
        type: 'update',
        domainId,
        config: updatedConfig,
        timestamp: new Date(),
      });

      console.log(`[DomainRegistry] Updated domain: ${domainId}`);
    },

    clear(): void {
      const domainIds = Array.from(domains.keys());
      domains.clear();
      domainIds.forEach((domainId) => {
        emitEvent({
          type: 'unregister',
          domainId,
          timestamp: new Date(),
        });
      });
      console.log('[DomainRegistry] Cleared all domains');
    },
  };
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global domain registry instance
 *
 * @example
 * ```typescript
 * import { domainRegistry } from '@xalatechnologies/platform/config';
 *
 * // Register a domain
 * domainRegistry.register({
 *   id: 'digilist',
 *   name: 'Digilist',
 *   // ...
 * });
 *
 * // Query domains
 * const domains = domainRegistry.list();
 * const routes = domainRegistry.getRoutes('digilist');
 * ```
 */
export const domainRegistry: DomainRegistry = createDomainRegistry();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a domain configuration builder for fluent API
 *
 * @param id - Domain identifier
 * @returns Builder instance
 *
 * @example
 * ```typescript
 * const config = createDomainBuilder('digilist')
 *   .name('Digilist Booking Platform')
 *   .description('Municipal rental and booking system')
 *   .version('1.0.0')
 *   .addApp({ id: 'web', name: 'Public Web', port: 5173, routes: ['/'] })
 *   .addFeature('bookings')
 *   .addRoute({ path: '/admin', requiredPermissions: ['admin:read'], requiredFeatures: [] })
 *   .addNavPolicy({ id: 'dashboard', label: 'Dashboard', route: '/', requiredPermissions: [] })
 *   .build();
 * ```
 */
export function createDomainBuilder(id: string) {
  const config: DomainConfig = {
    id,
    name: '',
    description: '',
    version: '1.0.0',
    apps: [],
    features: [],
    routes: [],
    navPolicies: [],
    integrations: [],
  };

  return {
    name(name: string) {
      config.name = name;
      return this;
    },

    description(description: string) {
      config.description = description;
      return this;
    },

    version(version: string) {
      config.version = version;
      return this;
    },

    addApp(app: DomainApp) {
      config.apps.push(app);
      return this;
    },

    addFeature(feature: string) {
      if (!config.features.includes(feature)) {
        config.features.push(feature);
      }
      return this;
    },

    addFeatures(features: string[]) {
      features.forEach((f) => this.addFeature(f));
      return this;
    },

    addRoute(route: RouteConfig) {
      config.routes.push(route);
      return this;
    },

    addNavPolicy(policy: NavPolicy) {
      config.navPolicies.push(policy);
      return this;
    },

    addIntegration(integration: DomainIntegration) {
      config.integrations = config.integrations || [];
      config.integrations.push(integration);
      return this;
    },

    metadata(metadata: Record<string, unknown>) {
      config.metadata = { ...config.metadata, ...metadata };
      return this;
    },

    build(): DomainConfig {
      if (!config.name) {
        throw new Error('Domain name is required');
      }
      return { ...config };
    },

    register(): DomainConfig {
      const builtConfig = this.build();
      domainRegistry.register(builtConfig);
      return builtConfig;
    },
  };
}

/**
 * Check if a user has access to a route based on their permissions and tenant features
 *
 * @param route - Route configuration
 * @param userPermissions - User's granted permissions
 * @param tenantFeatures - Features enabled for the tenant
 * @returns true if user can access the route
 */
export function canAccessRoute(
  route: RouteConfig,
  userPermissions: string[],
  tenantFeatures: string[]
): boolean {
  // Public routes are always accessible
  if (route.isPublic) {
    return true;
  }

  // Check all required permissions
  const hasPermissions = route.requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  // Check all required features
  const hasFeatures = route.requiredFeatures.every((feature) =>
    tenantFeatures.includes(feature)
  );

  return hasPermissions && hasFeatures;
}

/**
 * Filter navigation policies based on user permissions and tenant features
 *
 * @param policies - Array of navigation policies
 * @param userPermissions - User's granted permissions
 * @param tenantFeatures - Features enabled for the tenant
 * @returns Filtered array of accessible navigation policies
 */
export function filterAccessibleNavPolicies(
  policies: NavPolicy[],
  userPermissions: string[],
  tenantFeatures: string[]
): NavPolicy[] {
  return policies.filter((policy) => {
    // Check required permissions
    const hasPermissions = policy.requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    // Check required features (if any)
    const hasFeatures = (policy.requiredFeatures ?? []).every((feature) =>
      tenantFeatures.includes(feature)
    );

    return hasPermissions && hasFeatures;
  });
}

/**
 * Get navigation hierarchy from flat policies
 *
 * @param policies - Flat array of navigation policies
 * @returns Hierarchical navigation structure
 */
export function buildNavHierarchy(policies: NavPolicy[]): Array<NavPolicy & { children: NavPolicy[] }> {
  // Separate root items and children
  const rootItems = policies.filter((p) => !p.parentId);
  const childItems = policies.filter((p) => p.parentId);

  // Build hierarchy
  return rootItems
    .map((root) => ({
      ...root,
      children: childItems
        .filter((child) => child.parentId === root.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
