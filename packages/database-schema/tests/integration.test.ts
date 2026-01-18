/**
 * Integration Tests
 * Tests actual database operations (requires DATABASE_URL)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import {
  routePolicies,
  navPolicies,
  planEntitlements,
  tenantEntitlementOverrides,
  integrationConfigs,
  globalKillSwitches,
  entitlementAuditLog,
} from '../src/entitlements.js';

const DATABASE_URL = process.env.DATABASE_URL;

// Skip integration tests if no database URL provided
const describeIf = DATABASE_URL ? describe : describe.skip;

describeIf('Database Integration Tests', () => {
  let queryClient: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle>;

  beforeAll(async () => {
    if (!DATABASE_URL) return;
    
    queryClient = postgres(DATABASE_URL);
    db = drizzle(queryClient);
  });

  afterAll(async () => {
    if (queryClient) {
      await queryClient.end();
    }
  });

  describe('Schema Existence', () => {
    it('should have saas schema', async () => {
      const result = await db.execute(
        sql`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'saas'`
      );
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have all entitlement tables', async () => {
      const tables = [
        'entitlement_audit_log',
        'global_kill_switches',
        'integration_configs',
        'nav_policies',
        'plan_entitlements',
        'route_policies',
        'tenant_entitlement_overrides',
      ];

      for (const table of tables) {
        const result = await db.execute(
          sql`SELECT table_name FROM information_schema.tables 
              WHERE table_schema = 'saas' AND table_name = ${table}`
        );
        expect(result.length).toBe(1);
      }
    });
  });

  describe('Table Structure', () => {
    it('should have correct columns in route_policies', async () => {
      const result = await db.execute(
        sql`SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'saas' AND table_name = 'route_policies'
            ORDER BY ordinal_position`
      );

      const columns = result.map((r: any) => r.column_name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('app');
      expect(columns).toContain('route_key');
      expect(columns).toContain('required_roles');
      expect(columns).toContain('required_modules');
      expect(columns).toContain('required_features');
      expect(columns).toContain('is_public');
    });

    it('should have correct columns in nav_policies', async () => {
      const result = await db.execute(
        sql`SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'saas' AND table_name = 'nav_policies'`
      );

      const columns = result.map((r: any) => r.column_name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('app');
      expect(columns).toContain('nav_item_key');
      expect(columns).toContain('route_key');
      expect(columns).toContain('label_key');
      expect(columns).toContain('icon_key');
      expect(columns).toContain('parent_key');
      expect(columns).toContain('order');
    });

    it('should have correct columns in plan_entitlements', async () => {
      const result = await db.execute(
        sql`SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'saas' AND table_name = 'plan_entitlements'`
      );

      const columns = result.map((r: any) => r.column_name);
      
      expect(columns).toContain('id');
      expect(columns).toContain('plan_id');
      expect(columns).toContain('key_type');
      expect(columns).toContain('key');
      expect(columns).toContain('default_enabled');
    });
  });

  describe('Indexes', () => {
    it('should have indexes on route_policies', async () => {
      const result = await db.execute(
        sql`SELECT indexname FROM pg_indexes 
            WHERE schemaname = 'saas' AND tablename = 'route_policies'`
      );

      const indexes = result.map((r: any) => r.indexname);
      
      expect(indexes.some((i: string) => i.includes('app'))).toBe(true);
      expect(indexes.some((i: string) => i.includes('route_key'))).toBe(true);
    });

    it('should have indexes on nav_policies', async () => {
      const result = await db.execute(
        sql`SELECT indexname FROM pg_indexes 
            WHERE schemaname = 'saas' AND tablename = 'nav_policies'`
      );

      const indexes = result.map((r: any) => r.indexname);
      
      expect(indexes.some((i: string) => i.includes('app'))).toBe(true);
      expect(indexes.some((i: string) => i.includes('order'))).toBe(true);
    });
  });

  describe('Constraints', () => {
    it('should have unique constraint on route_key', async () => {
      const result = await db.execute(
        sql`SELECT constraint_name FROM information_schema.table_constraints 
            WHERE table_schema = 'saas' 
            AND table_name = 'route_policies' 
            AND constraint_type = 'UNIQUE'`
      );

      expect(result.length).toBeGreaterThan(0);
    });

    it('should have unique constraint on nav_item_key per app', async () => {
      const result = await db.execute(
        sql`SELECT constraint_name FROM information_schema.table_constraints 
            WHERE table_schema = 'saas' 
            AND table_name = 'nav_policies' 
            AND constraint_type = 'UNIQUE'`
      );

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('CRUD Operations', () => {
    it('should insert and query route policy', async () => {
      const testRoute = {
        app: 'test',
        routeKey: 'test.route.integration',
        requiredRoles: ['ADMIN'],
        requiredModules: [],
        requiredFeatures: [],
        isPublic: false,
        description: 'Integration test route',
      };

      // Insert
      await db.insert(routePolicies).values(testRoute).onConflictDoNothing();

      // Query
      const result = await db.execute(
        sql`SELECT * FROM saas.route_policies WHERE route_key = 'test.route.integration'`
      );

      expect(result.length).toBe(1);
      expect(result[0].app).toBe('test');

      // Cleanup
      await db.execute(
        sql`DELETE FROM saas.route_policies WHERE route_key = 'test.route.integration'`
      );
    });

    it('should handle idempotent inserts', async () => {
      const testRoute = {
        app: 'test',
        routeKey: 'test.route.idempotent',
        requiredRoles: [],
        requiredModules: [],
        requiredFeatures: [],
        isPublic: true,
      };

      // Insert twice
      await db.insert(routePolicies).values(testRoute).onConflictDoNothing();
      await db.insert(routePolicies).values(testRoute).onConflictDoNothing();

      // Should only have one record
      const result = await db.execute(
        sql`SELECT COUNT(*) as count FROM saas.route_policies WHERE route_key = 'test.route.idempotent'`
      );

      expect(Number(result[0].count)).toBe(1);

      // Cleanup
      await db.execute(
        sql`DELETE FROM saas.route_policies WHERE route_key = 'test.route.idempotent'`
      );
    });
  });
});
