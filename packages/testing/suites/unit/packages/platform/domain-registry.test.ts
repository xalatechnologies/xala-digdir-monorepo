/**
 * Domain Registry Unit Tests
 *
 * Tests for the @xalatechnologies/platform/config domain registry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  domainRegistry,
  createDomainBuilder,
  canAccessRoute,
  filterAccessibleNavPolicies,
  buildNavHierarchy,
  type DomainConfig,
  type RouteConfig,
  type NavPolicy,
} from '@xalatechnologies/platform/config';

describe('domainRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    domainRegistry.clear();
  });

  describe('register', () => {
    it('should register a new domain', () => {
      const config: DomainConfig = {
        id: 'test-domain',
        name: 'Test Domain',
        description: 'A test domain',
        version: '1.0.0',
        apps: [],
        features: ['feature1', 'feature2'],
        routes: [],
        navPolicies: [],
      };

      domainRegistry.register(config);

      expect(domainRegistry.has('test-domain')).toBe(true);
      const registered = domainRegistry.get('test-domain');
      expect(registered?.name).toBe('Test Domain');
      expect(registered?.registeredAt).toBeInstanceOf(Date);
    });

    it('should throw error when registering duplicate domain', () => {
      const config: DomainConfig = {
        id: 'duplicate-domain',
        name: 'Domain 1',
        description: 'First domain',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      };

      domainRegistry.register(config);

      expect(() => domainRegistry.register(config)).toThrow(
        'Domain "duplicate-domain" is already registered'
      );
    });

    it('should throw error when missing required fields', () => {
      const config = {
        id: '',
        name: '',
        description: 'No ID or name',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      } as DomainConfig;

      expect(() => domainRegistry.register(config)).toThrow(
        'Domain configuration must include id, name, and version'
      );
    });
  });

  describe('unregister', () => {
    it('should unregister an existing domain', () => {
      const config: DomainConfig = {
        id: 'to-remove',
        name: 'Remove Me',
        description: 'Domain to remove',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      };

      domainRegistry.register(config);
      expect(domainRegistry.has('to-remove')).toBe(true);

      const result = domainRegistry.unregister('to-remove');

      expect(result).toBe(true);
      expect(domainRegistry.has('to-remove')).toBe(false);
    });

    it('should return false when domain does not exist', () => {
      const result = domainRegistry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('should return all registered domains', () => {
      domainRegistry.register({
        id: 'domain-1',
        name: 'Domain 1',
        description: 'First domain',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      domainRegistry.register({
        id: 'domain-2',
        name: 'Domain 2',
        description: 'Second domain',
        version: '2.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      const domains = domainRegistry.list();

      expect(domains).toHaveLength(2);
      expect(domains.map((d) => d.id)).toContain('domain-1');
      expect(domains.map((d) => d.id)).toContain('domain-2');
    });
  });

  describe('getRoutes', () => {
    it('should return routes for a domain', () => {
      const routes: RouteConfig[] = [
        { path: '/dashboard', requiredPermissions: ['read'], requiredFeatures: [] },
        { path: '/settings', requiredPermissions: ['admin'], requiredFeatures: ['settings'] },
      ];

      domainRegistry.register({
        id: 'route-domain',
        name: 'Route Domain',
        description: 'Domain with routes',
        version: '1.0.0',
        apps: [],
        features: [],
        routes,
        navPolicies: [],
      });

      const result = domainRegistry.getRoutes('route-domain');

      expect(result).toHaveLength(2);
      expect(result[0].path).toBe('/dashboard');
    });

    it('should return empty array for non-existent domain', () => {
      const result = domainRegistry.getRoutes('non-existent');
      expect(result).toEqual([]);
    });
  });

  describe('getNavPolicies', () => {
    it('should return nav policies for a domain', () => {
      const navPolicies: NavPolicy[] = [
        { id: 'nav-1', label: 'Dashboard', route: '/', requiredPermissions: [] },
        { id: 'nav-2', label: 'Settings', route: '/settings', requiredPermissions: ['admin'] },
      ];

      domainRegistry.register({
        id: 'nav-domain',
        name: 'Nav Domain',
        description: 'Domain with nav policies',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies,
      });

      const result = domainRegistry.getNavPolicies('nav-domain');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('nav-1');
    });
  });

  describe('getNavPoliciesForApp', () => {
    it('should return nav policies for a specific app', () => {
      const navPolicies: NavPolicy[] = [
        { id: 'web-nav', label: 'Web Nav', route: '/', requiredPermissions: [], app: 'web' },
        { id: 'admin-nav', label: 'Admin Nav', route: '/admin', requiredPermissions: [], app: 'backoffice' },
      ];

      domainRegistry.register({
        id: 'multi-app-domain',
        name: 'Multi App Domain',
        description: 'Domain with multiple apps',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies,
      });

      const webNav = domainRegistry.getNavPoliciesForApp('multi-app-domain', 'web');
      const adminNav = domainRegistry.getNavPoliciesForApp('multi-app-domain', 'backoffice');

      expect(webNav).toHaveLength(1);
      expect(webNav[0].id).toBe('web-nav');
      expect(adminNav).toHaveLength(1);
      expect(adminNav[0].id).toBe('admin-nav');
    });
  });

  describe('getAllFeatures', () => {
    it('should return all unique features across domains', () => {
      domainRegistry.register({
        id: 'domain-a',
        name: 'Domain A',
        description: 'First',
        version: '1.0.0',
        apps: [],
        features: ['feature1', 'feature2'],
        routes: [],
        navPolicies: [],
      });

      domainRegistry.register({
        id: 'domain-b',
        name: 'Domain B',
        description: 'Second',
        version: '1.0.0',
        apps: [],
        features: ['feature2', 'feature3'],
        routes: [],
        navPolicies: [],
      });

      const features = domainRegistry.getAllFeatures();

      expect(features).toHaveLength(3);
      expect(features).toContain('feature1');
      expect(features).toContain('feature2');
      expect(features).toContain('feature3');
    });
  });

  describe('getAllApps', () => {
    it('should return all apps with domain context', () => {
      domainRegistry.register({
        id: 'domain-x',
        name: 'Domain X',
        description: 'X',
        version: '1.0.0',
        apps: [
          { id: 'app-1', name: 'App 1', port: 3000, routes: ['/'] },
          { id: 'app-2', name: 'App 2', port: 3001, routes: ['/app2'] },
        ],
        features: [],
        routes: [],
        navPolicies: [],
      });

      const apps = domainRegistry.getAllApps();

      expect(apps).toHaveLength(2);
      expect(apps[0].domainId).toBe('domain-x');
      expect(apps[0].id).toBe('app-1');
    });
  });

  describe('findByFeature', () => {
    it('should find domains that provide a feature', () => {
      domainRegistry.register({
        id: 'booking-domain',
        name: 'Booking Domain',
        description: 'Has bookings',
        version: '1.0.0',
        apps: [],
        features: ['bookings', 'payments'],
        routes: [],
        navPolicies: [],
      });

      domainRegistry.register({
        id: 'crm-domain',
        name: 'CRM Domain',
        description: 'No bookings',
        version: '1.0.0',
        apps: [],
        features: ['contacts', 'leads'],
        routes: [],
        navPolicies: [],
      });

      const bookingDomains = domainRegistry.findByFeature('bookings');
      const contactDomains = domainRegistry.findByFeature('contacts');

      expect(bookingDomains).toHaveLength(1);
      expect(bookingDomains[0].id).toBe('booking-domain');
      expect(contactDomains).toHaveLength(1);
      expect(contactDomains[0].id).toBe('crm-domain');
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on register', () => {
      const listener = vi.fn();
      const unsubscribe = domainRegistry.subscribe(listener);

      domainRegistry.register({
        id: 'subscribe-test',
        name: 'Subscribe Test',
        description: 'Test',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'register',
          domainId: 'subscribe-test',
        })
      );

      unsubscribe();
    });

    it('should notify listeners on unregister', () => {
      domainRegistry.register({
        id: 'to-unregister',
        name: 'To Unregister',
        description: 'Test',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      const listener = vi.fn();
      domainRegistry.subscribe(listener);

      domainRegistry.unregister('to-unregister');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unregister',
          domainId: 'to-unregister',
        })
      );
    });

    it('should allow unsubscribing', () => {
      const listener = vi.fn();
      const unsubscribe = domainRegistry.subscribe(listener);

      unsubscribe();

      domainRegistry.register({
        id: 'after-unsub',
        name: 'After Unsub',
        description: 'Test',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing domain', () => {
      domainRegistry.register({
        id: 'updatable',
        name: 'Original Name',
        description: 'Original',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      domainRegistry.update('updatable', {
        name: 'Updated Name',
        version: '2.0.0',
      });

      const updated = domainRegistry.get('updatable');
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.version).toBe('2.0.0');
      expect(updated?.id).toBe('updatable'); // ID should not change
    });

    it('should throw error when updating non-existent domain', () => {
      expect(() =>
        domainRegistry.update('non-existent', { name: 'New Name' })
      ).toThrow('Domain "non-existent" is not registered');
    });
  });

  describe('clear', () => {
    it('should clear all domains', () => {
      domainRegistry.register({
        id: 'domain-1',
        name: 'Domain 1',
        description: 'First',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      domainRegistry.register({
        id: 'domain-2',
        name: 'Domain 2',
        description: 'Second',
        version: '1.0.0',
        apps: [],
        features: [],
        routes: [],
        navPolicies: [],
      });

      domainRegistry.clear();

      expect(domainRegistry.list()).toHaveLength(0);
    });
  });
});

describe('createDomainBuilder', () => {
  beforeEach(() => {
    domainRegistry.clear();
  });

  it('should create a domain configuration using builder', () => {
    const config = createDomainBuilder('builder-test')
      .name('Builder Test Domain')
      .description('Created with builder')
      .version('1.0.0')
      .addApp({ id: 'web', name: 'Web App', port: 3000, routes: ['/'] })
      .addFeature('feature1')
      .addFeatures(['feature2', 'feature3'])
      .addRoute({
        path: '/test',
        requiredPermissions: ['read'],
        requiredFeatures: [],
      })
      .addNavPolicy({
        id: 'test-nav',
        label: 'Test',
        route: '/test',
        requiredPermissions: [],
      })
      .metadata({ custom: 'value' })
      .build();

    expect(config.id).toBe('builder-test');
    expect(config.name).toBe('Builder Test Domain');
    expect(config.apps).toHaveLength(1);
    expect(config.features).toEqual(['feature1', 'feature2', 'feature3']);
    expect(config.routes).toHaveLength(1);
    expect(config.navPolicies).toHaveLength(1);
    expect(config.metadata).toEqual({ custom: 'value' });
  });

  it('should register domain directly using register()', () => {
    createDomainBuilder('direct-register')
      .name('Direct Register')
      .description('Registered directly')
      .version('1.0.0')
      .register();

    expect(domainRegistry.has('direct-register')).toBe(true);
  });

  it('should not add duplicate features', () => {
    const config = createDomainBuilder('dedup-test')
      .name('Dedup Test')
      .description('Test')
      .version('1.0.0')
      .addFeature('same')
      .addFeature('same')
      .addFeature('same')
      .build();

    expect(config.features).toEqual(['same']);
  });

  it('should throw error when building without name', () => {
    expect(() =>
      createDomainBuilder('no-name').version('1.0.0').build()
    ).toThrow('Domain name is required');
  });
});

describe('canAccessRoute', () => {
  it('should allow access to public routes', () => {
    const route: RouteConfig = {
      path: '/public',
      requiredPermissions: ['admin'],
      requiredFeatures: ['premium'],
      isPublic: true,
    };

    expect(canAccessRoute(route, [], [])).toBe(true);
  });

  it('should require all permissions', () => {
    const route: RouteConfig = {
      path: '/admin',
      requiredPermissions: ['admin:read', 'admin:write'],
      requiredFeatures: [],
    };

    expect(canAccessRoute(route, ['admin:read'], [])).toBe(false);
    expect(canAccessRoute(route, ['admin:read', 'admin:write'], [])).toBe(true);
  });

  it('should require all features', () => {
    const route: RouteConfig = {
      path: '/premium',
      requiredPermissions: [],
      requiredFeatures: ['premium', 'analytics'],
    };

    expect(canAccessRoute(route, [], ['premium'])).toBe(false);
    expect(canAccessRoute(route, [], ['premium', 'analytics'])).toBe(true);
  });

  it('should require both permissions and features', () => {
    const route: RouteConfig = {
      path: '/admin-premium',
      requiredPermissions: ['admin'],
      requiredFeatures: ['premium'],
    };

    expect(canAccessRoute(route, ['admin'], [])).toBe(false);
    expect(canAccessRoute(route, [], ['premium'])).toBe(false);
    expect(canAccessRoute(route, ['admin'], ['premium'])).toBe(true);
  });
});

describe('filterAccessibleNavPolicies', () => {
  it('should filter nav policies based on permissions', () => {
    const policies: NavPolicy[] = [
      { id: 'public', label: 'Public', route: '/', requiredPermissions: [] },
      { id: 'admin', label: 'Admin', route: '/admin', requiredPermissions: ['admin'] },
      { id: 'super', label: 'Super', route: '/super', requiredPermissions: ['super'] },
    ];

    const filtered = filterAccessibleNavPolicies(policies, ['admin'], []);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((p) => p.id)).toEqual(['public', 'admin']);
  });

  it('should filter nav policies based on features', () => {
    const policies: NavPolicy[] = [
      { id: 'basic', label: 'Basic', route: '/', requiredPermissions: [] },
      { id: 'premium', label: 'Premium', route: '/premium', requiredPermissions: [], requiredFeatures: ['premium'] },
    ];

    const withoutPremium = filterAccessibleNavPolicies(policies, [], []);
    const withPremium = filterAccessibleNavPolicies(policies, [], ['premium']);

    expect(withoutPremium).toHaveLength(1);
    expect(withPremium).toHaveLength(2);
  });
});

describe('buildNavHierarchy', () => {
  it('should build navigation hierarchy from flat policies', () => {
    const policies: NavPolicy[] = [
      { id: 'parent', label: 'Parent', route: '/parent', requiredPermissions: [], order: 1 },
      { id: 'child-1', label: 'Child 1', route: '/parent/child1', requiredPermissions: [], parentId: 'parent', order: 1 },
      { id: 'child-2', label: 'Child 2', route: '/parent/child2', requiredPermissions: [], parentId: 'parent', order: 2 },
      { id: 'standalone', label: 'Standalone', route: '/standalone', requiredPermissions: [], order: 2 },
    ];

    const hierarchy = buildNavHierarchy(policies);

    expect(hierarchy).toHaveLength(2);
    expect(hierarchy[0].id).toBe('parent');
    expect(hierarchy[0].children).toHaveLength(2);
    expect(hierarchy[0].children[0].id).toBe('child-1');
    expect(hierarchy[0].children[1].id).toBe('child-2');
    expect(hierarchy[1].id).toBe('standalone');
    expect(hierarchy[1].children).toHaveLength(0);
  });

  it('should sort by order', () => {
    const policies: NavPolicy[] = [
      { id: 'third', label: 'Third', route: '/third', requiredPermissions: [], order: 3 },
      { id: 'first', label: 'First', route: '/first', requiredPermissions: [], order: 1 },
      { id: 'second', label: 'Second', route: '/second', requiredPermissions: [], order: 2 },
    ];

    const hierarchy = buildNavHierarchy(policies);

    expect(hierarchy[0].id).toBe('first');
    expect(hierarchy[1].id).toBe('second');
    expect(hierarchy[2].id).toBe('third');
  });
});
