/**
 * Demo Login Users Seed
 * Seeds demo users with tokens for testing login across all apps
 *
 * Based on: /docs/DEMO_USERS.md
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { tenants, users } from '../schema/index';

// =============================================================================
// DEMO LOGIN USERS
// =============================================================================

interface DemoUser {
  id: string;
  name: string;
  email: string;
  demoToken: string;
  role: string;
  apps: string[];
}

const DEMO_LOGIN_USERS: DemoUser[] = [
  // Backoffice App Users
  {
    id: 'demo0000-0000-0000-0000-000000000001',
    name: 'Ola Nordmann',
    email: 'ola.nordmann@digilist.no',
    demoToken: 'demo-backoffice-super-admin-001',
    role: 'super_admin',
    apps: ['backoffice'],
  },
  {
    id: 'demo0000-0000-0000-0000-000000000002',
    name: 'Kari Hansen',
    email: 'kari.hansen@oslo.kommune.no',
    demoToken: 'demo-backoffice-admin-001',
    role: 'admin',
    apps: ['backoffice'],
  },
  {
    id: 'demo0000-0000-0000-0000-000000000003',
    name: 'Per Olsen',
    email: 'per.olsen@bergen.kommune.no',
    demoToken: 'demo-backoffice-tenant-admin-001',
    role: 'tenant_admin',
    apps: ['backoffice'],
  },

  // Web App Users
  {
    id: 'demo0000-0000-0000-0000-000000000004',
    name: 'Emma Berg',
    email: 'emma.berg@example.com',
    demoToken: 'demo-web-user-001',
    role: 'user',
    apps: ['web'],
  },
  {
    id: 'demo0000-0000-0000-0000-000000000005',
    name: 'Sportsklubben Oslo',
    email: 'kontakt@sportsklubben-oslo.no',
    demoToken: 'demo-web-organization-001',
    role: 'organization',
    apps: ['web'],
  },

  // Minside App Users
  {
    id: 'demo0000-0000-0000-0000-000000000006',
    name: 'Lars Andersen',
    email: 'lars.andersen@example.com',
    demoToken: 'demo-minside-user-001',
    role: 'user',
    apps: ['minside'],
  },
  {
    id: 'demo0000-0000-0000-0000-000000000007',
    name: 'Idrettslaget Vestland',
    email: 'post@idrettslaget-vestland.no',
    demoToken: 'demo-minside-organization-001',
    role: 'organization',
    apps: ['minside'],
  },

  // SaaS Admin App Users
  {
    id: 'demo0000-0000-0000-0000-000000000008',
    name: 'Admin Digilist',
    email: 'admin@digilist.no',
    demoToken: 'demo-saas-admin-super-admin-001',
    role: 'super_admin',
    apps: ['saas-admin'],
  },
  {
    id: 'demo0000-0000-0000-0000-000000000009',
    name: 'Support Team',
    email: 'support@digilist.no',
    demoToken: 'demo-saas-admin-support-001',
    role: 'super_admin',
    apps: ['saas-admin'],
  },

  // Tenant Admin App Users
  {
    id: 'demo0000-0000-0000-0000-000000000010',
    name: 'Kristine Johnsen',
    email: 'kristine.johnsen@trondheim.kommune.no',
    demoToken: 'demo-tenant-admin-admin-001',
    role: 'tenant_admin',
    apps: ['tenant-admin'],
  },
  {
    id: 'demo0000-0000-0000-0000-000000000011',
    name: 'Morten Larsen',
    email: 'morten.larsen@stavanger.kommune.no',
    demoToken: 'demo-tenant-admin-configurator-001',
    role: 'tenant_admin',
    apps: ['tenant-admin'],
  },

  // Multi-App Access User (Testing)
  {
    id: 'demo0000-0000-0000-0000-000000000012',
    name: 'Test User Full Access',
    email: 'test.fullaccess@digilist.no',
    demoToken: 'demo-all-apps-super-admin-001',
    role: 'super_admin',
    apps: ['backoffice', 'web', 'minside', 'saas-admin', 'tenant-admin'],
  },
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

async function seedDemoLoginUsers() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🔑 DEMO LOGIN USERS SEED 🔑                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 10 });
  const db = drizzle(sql);

  try {
    // Get demo tenant (Skien Kommune from demo-seed-v3)
    console.log('🏢 Looking for demo tenant...');
    const demoTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, 'skien'))
      .limit(1);

    if (demoTenant.length === 0) {
      console.error('❌ Demo tenant not found. Please run demo-seed-v3 first.');
      console.error('   Run: cd apps/api && pnpm tsx src/database/seeds/demo-seed-v3.ts');
      process.exit(1);
    }

    const tenantId = demoTenant[0].id;
    console.log(`  ✅ Using tenant: ${demoTenant[0].name} (${tenantId})`);
    console.log('');

    // Seed demo login users
    console.log('👥 Seeding demo login users...');
    let seededCount = 0;
    let skippedCount = 0;

    for (const user of DEMO_LOGIN_USERS) {
      const exists = await db
        .select()
        .from(users)
        .where(eq(users.demoToken, user.demoToken))
        .limit(1);

      if (exists.length === 0) {
        await db.insert(users).values({
          id: user.id,
          tenantId,
          email: user.email,
          name: user.name,
          role: user.role,
          demoToken: user.demoToken,
          status: 'active',
          metadata: { apps: user.apps },
        });
        console.log(`  ✅ ${user.name} (${user.role}) - ${user.demoToken}`);
        seededCount++;
      } else {
        console.log(`  ⏭️  ${user.name} - already exists`);
        skippedCount++;
      }
    }

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ DEMO LOGIN USERS SEED COMPLETE ✅                ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log(`║  📊 Summary:                                                 ║`);
    console.log(`║    • Total demo users: ${DEMO_LOGIN_USERS.length}                                    ║`);
    console.log(`║    • Seeded: ${seededCount}                                              ║`);
    console.log(`║    • Skipped (already exist): ${skippedCount}                            ║`);
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  🧪 Test Demo Login:                                         ║');
    console.log('║                                                              ║');
    console.log('║  Backoffice (Super Admin):                                   ║');
    console.log('║    Name: Ola Nordmann                                        ║');
    console.log('║    Email: ola.nordmann@digilist.no                           ║');
    console.log('║    Token: demo-backoffice-super-admin-001                    ║');
    console.log('║                                                              ║');
    console.log('║  Web (User):                                                 ║');
    console.log('║    Name: Emma Berg                                           ║');
    console.log('║    Email: emma.berg@example.com                              ║');
    console.log('║    Token: demo-web-user-001                                  ║');
    console.log('║                                                              ║');
    console.log('║  Minside (User):                                             ║');
    console.log('║    Name: Lars Andersen                                       ║');
    console.log('║    Email: lars.andersen@example.com                          ║');
    console.log('║    Token: demo-minside-user-001                              ║');
    console.log('║                                                              ║');
    console.log('║  SaaS Admin (Super Admin):                                   ║');
    console.log('║    Name: Admin Digilist                                      ║');
    console.log('║    Email: admin@digilist.no                                  ║');
    console.log('║    Token: demo-saas-admin-super-admin-001                    ║');
    console.log('║                                                              ║');
    console.log('║  Tenant Admin (Tenant Admin):                                ║');
    console.log('║    Name: Kristine Johnsen                                    ║');
    console.log('║    Email: kristine.johnsen@trondheim.kommune.no              ║');
    console.log('║    Token: demo-tenant-admin-admin-001                        ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('⚠️  Security Note: Demo tokens are for TESTING ONLY');
    console.log('    Disable demo login in production environments!');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDemoLoginUsers();
}

export { seedDemoLoginUsers, DEMO_LOGIN_USERS };
