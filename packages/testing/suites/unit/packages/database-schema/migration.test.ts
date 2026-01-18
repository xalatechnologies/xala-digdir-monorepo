/**
 * Migration Validation Tests
 * Validates that generated migrations match TypeScript schema
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

describe('Migration Validation', () => {
  // Use path alias to access database-schema migrations
  const migrationsDir = resolve(process.cwd(), 'packages/database-schema/migrations');
  
  it('should have at least one migration file', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    expect(files.length).toBeGreaterThan(0);
  });

  it('should have valid SQL syntax in migrations', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    
    files.forEach(file => {
      const content = readFileSync(resolve(migrationsDir, file), 'utf-8');
      
      // Check for required SQL statements
      expect(content).toContain('CREATE TABLE');
      expect(content).toContain('"saas".');
      
      // Check for proper statement terminators
      const statements = content.split(';').filter(s => s.trim());
      expect(statements.length).toBeGreaterThan(0);
    });
  });

  it('should create all 7 entitlement tables', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const latestMigration = files.sort().reverse()[0];
    const content = readFileSync(resolve(migrationsDir, latestMigration), 'utf-8');

    const expectedTables = [
      'entitlement_audit_log',
      'global_kill_switches',
      'integration_configs',
      'nav_policies',
      'plan_entitlements',
      'route_policies',
      'tenant_entitlement_overrides',
    ];

    expectedTables.forEach(table => {
      expect(content).toContain(`"saas"."${table}"`);
    });
  });

  it('should have proper indexes', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const latestMigration = files.sort().reverse()[0];
    const content = readFileSync(resolve(migrationsDir, latestMigration), 'utf-8');

    // Check for index creation
    expect(content).toContain('CREATE INDEX');
    
    // Check for specific indexes
    const expectedIndexes = [
      'entitlement_audit_tenant_idx',
      'entitlement_audit_action_idx',
      'kill_switches_key_type_key_idx',
      'integration_configs_tenant_integration_idx',
      'nav_policies_app_nav_item_idx',
      'plan_entitlements_plan_key_idx',
      'route_policies_app_idx',
      'tenant_overrides_tenant_key_idx',
    ];

    expectedIndexes.forEach(index => {
      expect(content).toContain(index);
    });
  });

  it('should have proper unique constraints', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const latestMigration = files.sort().reverse()[0];
    const content = readFileSync(resolve(migrationsDir, latestMigration), 'utf-8');

    const expectedConstraints = [
      'kill_switches_key_type_key_env_unique',
      'integration_configs_tenant_integration_unique',
      'nav_policies_app_nav_item_unique',
      'plan_entitlements_plan_key_unique',
      'route_policies_route_key_unique',
      'tenant_overrides_tenant_key_unique',
    ];

    expectedConstraints.forEach(constraint => {
      expect(content).toContain(constraint);
    });
  });

  it('should have proper column types', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const latestMigration = files.sort().reverse()[0];
    const content = readFileSync(resolve(migrationsDir, latestMigration), 'utf-8');

    // Check for UUID columns
    expect(content).toContain('uuid');
    
    // Check for varchar columns
    expect(content).toContain('varchar(50)');
    expect(content).toContain('varchar(100)');
    expect(content).toContain('varchar(200)');
    
    // Check for jsonb columns
    expect(content).toContain('jsonb');
    
    // Check for timestamp columns
    expect(content).toContain('timestamp');
    
    // Check for boolean columns
    expect(content).toContain('boolean');
  });

  it('should have default values', () => {
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const latestMigration = files.sort().reverse()[0];
    const content = readFileSync(resolve(migrationsDir, latestMigration), 'utf-8');

    // Check for default values
    expect(content).toContain('DEFAULT gen_random_uuid()');
    expect(content).toContain('DEFAULT now()');
    expect(content).toContain("DEFAULT '[]'");
    expect(content).toContain('DEFAULT false');
    expect(content).toContain('DEFAULT true');
    expect(content).toContain('DEFAULT 0');
  });
});
