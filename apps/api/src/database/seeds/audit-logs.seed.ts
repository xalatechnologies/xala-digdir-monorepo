/**
 * Audit Logs Seed - Activity History
 * Adds realistic audit log entries for activity history display
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { auditLogs, users, rentalObjects, bookings } from '../schema/index';

const DEMO_TENANT_ID = 'd0000000-0000-0000-0000-000000000001';

// Demo users from demo-seed-v3.ts
const DEMO_USERS = {
  CITIZEN: 'u0000000-0000-0000-0000-000000000001',
  CASEWORKER: 'u0000000-0000-0000-0000-000000000002',
  ADMIN: 'u0000000-0000-0000-0000-000000000003',
  SAAS_ADMIN: 'u0000000-0000-0000-0000-000000000004',
};

// Activity templates for realistic data
const ACTIVITIES = [
  // Recent activities (last 7 days)
  {
    action: 'create',
    resource: 'booking',
    resourceId: 'b0000000-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CITIZEN,
    severity: 'info',
    metadata: { listingName: 'Kulturhuset - Storsalen' },
    daysAgo: 0.5,
  },
  {
    action: 'confirm',
    resource: 'booking',
    resourceId: 'b0000001-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CASEWORKER,
    severity: 'info',
    metadata: { listingName: 'Idrettshallen - Hovedhall' },
    daysAgo: 1,
  },
  {
    action: 'create',
    resource: 'booking',
    resourceId: 'b0000002-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CITIZEN,
    severity: 'info',
    metadata: { listingName: 'Tennisbane 1' },
    daysAgo: 1.5,
  },
  {
    action: 'update',
    resource: 'listing',
    resourceId: 'r0000000-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { listingName: 'Kulturhuset - Storsalen', changes: ['pricing', 'description'] },
    daysAgo: 2,
  },
  {
    action: 'publish',
    resource: 'listing',
    resourceId: 'r0000015-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { listingName: 'Biblioteket - Auditorium' },
    daysAgo: 2.5,
  },
  {
    action: 'login',
    resource: 'auth',
    resourceId: DEMO_USERS.CASEWORKER,
    userId: DEMO_USERS.CASEWORKER,
    severity: 'info',
    metadata: { method: 'bankid' },
    daysAgo: 3,
  },
  {
    action: 'cancel',
    resource: 'booking',
    resourceId: 'b0000003-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CITIZEN,
    severity: 'warning',
    metadata: { listingName: 'Rådhussalen', reason: 'Endret planer' },
    daysAgo: 3.5,
  },
  {
    action: 'create',
    resource: 'user',
    resourceId: 'u0000005-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { userName: 'Ny Bruker', role: 'CITIZEN' },
    daysAgo: 4,
  },
  {
    action: 'update',
    resource: 'listing',
    resourceId: 'r0000005-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { listingName: 'Idrettshallen - Hovedhall', changes: ['capacity'] },
    daysAgo: 4.5,
  },
  {
    action: 'create',
    resource: 'booking',
    resourceId: 'b0000004-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CITIZEN,
    severity: 'info',
    metadata: { listingName: 'Padelbane 1' },
    daysAgo: 5,
  },
  {
    action: 'confirm',
    resource: 'booking',
    resourceId: 'b0000005-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CASEWORKER,
    severity: 'info',
    metadata: { listingName: 'Kommunehuset - Styrerom' },
    daysAgo: 5.5,
  },
  {
    action: 'login',
    resource: 'auth',
    resourceId: DEMO_USERS.ADMIN,
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { method: 'bankid' },
    daysAgo: 6,
  },
  {
    action: 'publish',
    resource: 'listing',
    resourceId: 'r0000025-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { listingName: 'Fotballbane - Kunstgress' },
    daysAgo: 6.5,
  },
  {
    action: 'create',
    resource: 'booking',
    resourceId: 'b0000006-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CITIZEN,
    severity: 'info',
    metadata: { listingName: 'Grendehuset Vest' },
    daysAgo: 7,
  },
  
  // Older activities (last 30 days)
  {
    action: 'complete',
    resource: 'booking',
    resourceId: 'b0000007-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CASEWORKER,
    severity: 'info',
    metadata: { listingName: 'Festiviteten - Hovedsal' },
    daysAgo: 10,
  },
  {
    action: 'create',
    resource: 'booking',
    resourceId: 'b0000008-0000-0000-0000-000000000001',
    userId: DEMO_USERS.CITIZEN,
    severity: 'info',
    metadata: { listingName: 'Svømmehallen - Hovedbasseng' },
    daysAgo: 12,
  },
  {
    action: 'archive',
    resource: 'listing',
    resourceId: 'r0000020-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'warning',
    metadata: { listingName: 'Gammelt Møterom', reason: 'Renovering' },
    daysAgo: 15,
  },
  {
    action: 'login',
    resource: 'auth',
    resourceId: DEMO_USERS.SAAS_ADMIN,
    userId: DEMO_USERS.SAAS_ADMIN,
    severity: 'info',
    metadata: { method: 'email' },
    daysAgo: 18,
  },
  {
    action: 'create',
    resource: 'listing',
    resourceId: 'r0000030-0000-0000-0000-000000000001',
    userId: DEMO_USERS.ADMIN,
    severity: 'info',
    metadata: { listingName: 'Nytt Lokale', category: 'LOKALER_OG_BANER' },
    daysAgo: 20,
  },
  {
    action: 'update',
    resource: 'user',
    resourceId: DEMO_USERS.CITIZEN,
    userId: DEMO_USERS.CITIZEN,
    severity: 'info',
    metadata: { changes: ['profile', 'preferences'] },
    daysAgo: 25,
  },
];

async function seedAuditLogs() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     📋 Seeding Audit Logs & Activity History 📋      ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 10 });
  const db = drizzle(sql);

  try {
    // Clear existing audit logs for demo tenant
    console.log('🗑️  Clearing existing audit logs...');
    await db.delete(auditLogs).where(eq(auditLogs.tenantId, DEMO_TENANT_ID));
    console.log('  ✅ Cleared');

    // Insert audit logs
    console.log('📝 Creating audit log entries...');
    let inserted = 0;

    for (const activity of ACTIVITIES) {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - Math.floor(activity.daysAgo));
      timestamp.setHours(timestamp.getHours() - Math.floor((activity.daysAgo % 1) * 24));

      await db.insert(auditLogs).values({
        tenantId: DEMO_TENANT_ID,
        userId: activity.userId,
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        severity: activity.severity,
        metadata: activity.metadata,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (compatible)',
        timestamp,
      });

      inserted++;
      console.log(`  ✅ ${activity.action} ${activity.resource} - ${activity.metadata.listingName || activity.metadata.userName || 'system'}`);
    }

    // Summary
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║            ✅ AUDIT LOGS SEED COMPLETE ✅             ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log('║                                                       ║');
    console.log(`║  📊 Total Activities: ${inserted}                              ║`);
    console.log('║  📅 Timespan: Last 30 days                            ║');
    console.log('║  🎯 Categories:                                       ║');
    console.log('║    • Bookings (create, confirm, cancel, complete)    ║');
    console.log('║    • Listings (create, update, publish, archive)     ║');
    console.log('║    • Users (create, update, login)                   ║');
    console.log('║                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedAuditLogs();

export { seedAuditLogs, ACTIVITIES };
