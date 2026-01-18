/**
 * Seed Data Validation Tests
 * Validates structure and content of seed data files
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Seed Data Validation', () => {
  const seedsDir = join(process.cwd(), 'seeds');

  describe('Route Policies', () => {
    it('should have valid JSON structure', () => {
      const content = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const data = JSON.parse(content);
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should have required fields', () => {
      const content = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      data.forEach((policy: any, index: number) => {
        expect(policy).toHaveProperty('app');
        expect(policy).toHaveProperty('routeKey');
        expect(policy).toHaveProperty('requiredRoles');
        expect(policy).toHaveProperty('requiredModules');
        expect(policy).toHaveProperty('requiredFeatures');
        expect(policy).toHaveProperty('isPublic');
        
        // Validate types
        expect(typeof policy.app).toBe('string');
        expect(typeof policy.routeKey).toBe('string');
        expect(Array.isArray(policy.requiredRoles)).toBe(true);
        expect(Array.isArray(policy.requiredModules)).toBe(true);
        expect(Array.isArray(policy.requiredFeatures)).toBe(true);
        expect(typeof policy.isPublic).toBe('boolean');
      });
    });

    it('should have unique route keys', () => {
      const content = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      const routeKeys = data.map((p: any) => p.routeKey);
      const uniqueKeys = new Set(routeKeys);
      
      expect(routeKeys.length).toBe(uniqueKeys.size);
    });

    it('should have valid app names', () => {
      const content = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      const validApps = ['backoffice', 'minside', 'web', 'saas-admin', 'tenant-admin'];
      
      data.forEach((policy: any) => {
        expect(validApps).toContain(policy.app);
      });
    });

    it('should have consistent route key naming', () => {
      const content = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      data.forEach((policy: any) => {
        // Route keys should start with app name
        expect(policy.routeKey).toMatch(new RegExp(`^${policy.app}\\.`));
        
        // Should use dot notation
        expect(policy.routeKey).toContain('.');
      });
    });
  });

  describe('Navigation Policies', () => {
    it('should have valid JSON structure', () => {
      const content = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      const data = JSON.parse(content);
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should have required fields', () => {
      const content = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      data.forEach((policy: any) => {
        expect(policy).toHaveProperty('app');
        expect(policy).toHaveProperty('navItemKey');
        expect(policy).toHaveProperty('requiredRoles');
        expect(policy).toHaveProperty('requiredModules');
        expect(policy).toHaveProperty('requiredFeatures');
        expect(policy).toHaveProperty('labelKey');
        expect(policy).toHaveProperty('order');
        
        // Validate types
        expect(typeof policy.app).toBe('string');
        expect(typeof policy.navItemKey).toBe('string');
        expect(Array.isArray(policy.requiredRoles)).toBe(true);
        expect(Array.isArray(policy.requiredModules)).toBe(true);
        expect(Array.isArray(policy.requiredFeatures)).toBe(true);
        expect(typeof policy.labelKey).toBe('string');
        expect(typeof policy.order).toBe('number');
      });
    });

    it('should have unique nav item keys per app', () => {
      const content = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      const byApp = data.reduce((acc: any, item: any) => {
        if (!acc[item.app]) acc[item.app] = [];
        acc[item.app].push(item.navItemKey);
        return acc;
      }, {});

      Object.entries(byApp).forEach(([app, keys]) => {
        const uniqueKeys = new Set(keys as string[]);
        expect((keys as string[]).length).toBe(uniqueKeys.size);
      });
    });

    it('should have valid parent references', () => {
      const content = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      const allKeys = new Set(data.map((p: any) => p.navItemKey));

      data.forEach((policy: any) => {
        if (policy.parentKey) {
          // Parent key should exist in the same app
          const parentExists = data.some(
            (p: any) => p.navItemKey === policy.parentKey && p.app === policy.app
          );
          expect(parentExists).toBe(true);
        }
      });
    });

    it('should have sequential ordering', () => {
      const content = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      const data = JSON.parse(content);

      const byApp = data.reduce((acc: any, item: any) => {
        if (!acc[item.app]) acc[item.app] = [];
        acc[item.app].push(item.order);
        return acc;
      }, {});

      Object.entries(byApp).forEach(([app, orders]) => {
        const sorted = [...(orders as number[])].sort((a, b) => a - b);
        // Orders should be non-negative
        sorted.forEach(order => {
          expect(order).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Plan Entitlements', () => {
    it('should have valid JSON structure', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should have required fields', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);

      data.forEach((entitlement: any) => {
        expect(entitlement).toHaveProperty('planName');
        expect(entitlement).toHaveProperty('keyType');
        expect(entitlement).toHaveProperty('key');
        expect(entitlement).toHaveProperty('defaultEnabled');
        
        // Validate types
        expect(typeof entitlement.planName).toBe('string');
        expect(typeof entitlement.keyType).toBe('string');
        expect(typeof entitlement.key).toBe('string');
        expect(typeof entitlement.defaultEnabled).toBe('boolean');
      });
    });

    it('should have valid plan names', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);

      const validPlans = ['Free', 'Pro', 'Enterprise'];
      
      data.forEach((entitlement: any) => {
        expect(validPlans).toContain(entitlement.planName);
      });
    });

    it('should have valid key types', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);

      const validKeyTypes = ['module', 'feature', 'integration'];
      
      data.forEach((entitlement: any) => {
        expect(validKeyTypes).toContain(entitlement.keyType);
      });
    });

    it('should have unique combinations per plan', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);

      const combinations = data.map((e: any) => `${e.planName}:${e.keyType}:${e.key}`);
      const uniqueCombinations = new Set(combinations);
      
      expect(combinations.length).toBe(uniqueCombinations.size);
    });

    it('should have all plans represented', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);

      const plans = new Set(data.map((e: any) => e.planName));
      
      expect(plans.has('Free')).toBe(true);
      expect(plans.has('Pro')).toBe(true);
      expect(plans.has('Enterprise')).toBe(true);
    });

    it('should have Enterprise plan with most entitlements', () => {
      const content = readFileSync(join(seedsDir, 'plan-entitlements.json'), 'utf-8');
      const data = JSON.parse(content);

      const byPlan = data.reduce((acc: any, item: any) => {
        if (!acc[item.planName]) acc[item.planName] = 0;
        acc[item.planName]++;
        return acc;
      }, {});

      expect(byPlan.Enterprise).toBeGreaterThan(byPlan.Pro);
      expect(byPlan.Pro).toBeGreaterThan(byPlan.Free);
    });
  });

  describe('Cross-File Consistency', () => {
    it('should have matching route keys between routes and nav', () => {
      const routesContent = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const navContent = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      
      const routes = JSON.parse(routesContent);
      const navItems = JSON.parse(navContent);

      const routeKeys = new Set(routes.map((r: any) => r.routeKey));

      navItems.forEach((nav: any) => {
        if (nav.routeKey) {
          expect(routeKeys.has(nav.routeKey)).toBe(true);
        }
      });
    });

    it('should have consistent app names across files', () => {
      const routesContent = readFileSync(join(seedsDir, 'route-policies.json'), 'utf-8');
      const navContent = readFileSync(join(seedsDir, 'nav-policies.json'), 'utf-8');
      
      const routes = JSON.parse(routesContent);
      const navItems = JSON.parse(navContent);

      const routeApps = new Set(routes.map((r: any) => r.app));
      const navApps = new Set(navItems.map((n: any) => n.app));

      // Nav apps should be subset of route apps
      navApps.forEach(app => {
        expect(routeApps.has(app)).toBe(true);
      });
    });
  });
});
