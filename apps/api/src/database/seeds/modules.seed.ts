/**
 * Modules Seed
 * Populates the module catalog and sets defaults for demo tenant
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { modules, tenantModules } from '../schema/modules';
import { tenants } from '../schema';
import { eq } from 'drizzle-orm';
import { MODULE_REGISTRY, type ModuleKeyType } from '@xala/contracts/modules';

// Demo tenant slug - adjust as needed
const DEMO_TENANT_SLUG = 'cheyenne-kommune';

/**
 * Seed module catalog from registry
 */
export async function seedModuleCatalog(db: NodePgDatabase<any>) {
  console.log('🔧 Seeding module catalog...');

  const moduleValues = Object.values(MODULE_REGISTRY).map((mod) => ({
    key: mod.key,
    name: mod.name,
    description: mod.description,
    category: mod.category,
    dependencies: mod.dependencies,
    capabilities: mod.capabilities,
    isCore: mod.isCore,
    defaultEnabled: mod.defaultEnabled,
    createdAt: new Date(),
  }));

  // Upsert modules (insert on conflict update)
  for (const mod of moduleValues) {
    await db
      .insert(modules)
      .values(mod)
      .onConflictDoUpdate({
        target: modules.key,
        set: {
          name: mod.name,
          description: mod.description,
          category: mod.category,
          dependencies: mod.dependencies,
          capabilities: mod.capabilities,
          isCore: mod.isCore,
          defaultEnabled: mod.defaultEnabled,
        },
      });
  }

  console.log(`✅ Seeded ${moduleValues.length} modules`);
  return moduleValues.length;
}

/**
 * Seed tenant module defaults for demo tenant
 */
export async function seedTenantModuleDefaults(db: NodePgDatabase<any>) {
  console.log('🔧 Seeding tenant module defaults...');

  // Find demo tenant using direct select
  const demoTenants = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, DEMO_TENANT_SLUG))
    .limit(1);
  
  const demoTenant = demoTenants[0];

  if (!demoTenant) {
    console.log(`⚠️  Demo tenant '${DEMO_TENANT_SLUG}' not found, skipping tenant defaults`);
    return 0;
  }

  // Modules to explicitly enable for demo (beyond defaults)
  const demoEnabledModules: ModuleKeyType[] = [
    // Core always on
    'CORE_AUTH',
    'CORE_TENANTS',
    'CORE_USERS',
    // Booking domain
    'RENTAL_OBJECTS',
    'BOOKINGS',
    'CALENDAR',
    'PRICING',
    'AVAILABILITY',
    'ALLOCATIONS',
    // Communication
    'NOTIFICATIONS',
    'INTERNAL_NOTES',
    // Experience
    'FAVORITES',
    'SEARCH',
    'SEO',
    'GEO',
    'HELP',
    // Compliance
    'AUDIT_LOGGING',
    'COMPLIANCE_GDPR',
    'ACTIVITIES',
  ];

  // Modules to explicitly disable for demo
  const demoDisabledModules: ModuleKeyType[] = [
    'MESSAGING', // Not enabled for demo
    'RATINGS', // Not enabled for demo
    'PAYMENTS', // Not enabled for demo
    'INVOICING',
    'PAYMENTS_VIPPS',
    'PAYMENTS_STRIPE',
    'SEASON_RENTAL',
    'INTEGRATIONS_IDPORTEN', // Disabled for local dev
    'INTEGRATIONS_BANKID',
    'INTEGRATIONS_VIPPS',
    'REPORTING',
    'RAG_SUPPORT',
  ];

  let count = 0;

  // Seed enabled modules
  for (const moduleKey of demoEnabledModules) {
    await db
      .insert(tenantModules)
      .values({
        tenantId: demoTenant.id,
        moduleKey,
        isEnabled: true,
        config: {},
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [tenantModules.tenantId, tenantModules.moduleKey],
        set: { isEnabled: true, updatedAt: new Date() },
      });
    count++;
  }

  // Seed disabled modules
  for (const moduleKey of demoDisabledModules) {
    await db
      .insert(tenantModules)
      .values({
        tenantId: demoTenant.id,
        moduleKey,
        isEnabled: false,
        config: {},
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [tenantModules.tenantId, tenantModules.moduleKey],
        set: { isEnabled: false, updatedAt: new Date() },
      });
    count++;
  }

  console.log(`✅ Seeded ${count} module states for demo tenant`);
  return count;
}

/**
 * Main seed function
 */
export async function seedModules(db: NodePgDatabase<any>) {
  console.log('\n📦 Starting modules seeding...\n');

  const catalogCount = await seedModuleCatalog(db);
  const tenantCount = await seedTenantModuleDefaults(db);

  console.log(`\n✅ Modules seeding complete: ${catalogCount} catalog entries, ${tenantCount} tenant overrides\n`);

  return { catalogCount, tenantCount };
}

export default seedModules;
