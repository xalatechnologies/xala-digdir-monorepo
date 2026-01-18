/**
 * Seed Data Importer for Entitlements System
 * Run this to populate route policies, nav policies, and plan entitlements
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { routePolicies, navPolicies, planEntitlements } from '../src/saas/entitlements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Connect to database
const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient);

async function importSeeds() {
  console.log('🌱 Starting entitlements seed import...\n');

  try {
    // Load seed data
    const routePoliciesData = JSON.parse(
      readFileSync(join(__dirname, 'route-policies.json'), 'utf-8')
    );
    const navPoliciesData = JSON.parse(
      readFileSync(join(__dirname, 'nav-policies.json'), 'utf-8')
    );
    const planEntitlementsData = JSON.parse(
      readFileSync(join(__dirname, 'plan-entitlements.json'), 'utf-8')
    );

    // Import route policies
    console.log(`📋 Importing ${routePoliciesData.length} route policies...`);
    for (const policy of routePoliciesData) {
      await db.insert(routePolicies).values(policy).onConflictDoNothing();
    }
    console.log('✅ Route policies imported\n');

    // Import nav policies
    console.log(`🧭 Importing ${navPoliciesData.length} navigation policies...`);
    for (const policy of navPoliciesData) {
      await db.insert(navPolicies).values(policy).onConflictDoNothing();
    }
    console.log('✅ Navigation policies imported\n');

    // Import plan entitlements (requires plan IDs from database)
    console.log(`📦 Checking for plan entitlements...`);
    
    // Check if plans table exists
    const tableCheck = await queryClient`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'saas' 
        AND table_name = 'plans'
      )
    `;
    
    if (!tableCheck[0].exists) {
      console.log('⚠️  saas.plans table does not exist. Skipping plan entitlements.');
      console.log('   This is expected if you haven\'t created the plans table yet.');
    } else {
      console.log(`📦 Importing ${planEntitlementsData.length} plan entitlements...`);
      
      // Group by plan name
      const byPlan = planEntitlementsData.reduce((acc: any, item: any) => {
        if (!acc[item.planName]) acc[item.planName] = [];
        acc[item.planName].push(item);
        return acc;
      }, {});

      // Get plan IDs from database
      const plans = await queryClient`SELECT id, name FROM saas.plans WHERE name IN ('Free', 'Pro', 'Enterprise')`;

      if (plans.length === 0) {
        console.log('⚠️  No plans found in database. Skipping plan entitlements.');
        console.log('   Create plans first, then run this seed again.');
      } else {
      const planMap = new Map(plans.map((p: any) => [p.name, p.id]));
      let totalImported = 0;

      for (const [planName, entitlements] of Object.entries(byPlan)) {
        const planId = planMap.get(planName);
        if (!planId) {
          console.log(`⚠️  Plan "${planName}" not found in database, skipping...`);
          continue;
        }

        for (const ent of entitlements as any[]) {
          await db.insert(planEntitlements).values({
            planId,
            keyType: ent.keyType,
            key: ent.key,
            defaultEnabled: ent.defaultEnabled,
          }).onConflictDoNothing();
          totalImported++;
        }
        console.log(`   ✓ ${planName}: ${(entitlements as any[]).length} entitlements`);
      }
      console.log(`✅ Imported ${totalImported} plan entitlements`);
      }
    }

    console.log('\n✅ Seed import completed successfully!');
  } catch (error) {
    console.error('❌ Seed import failed:', error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

importSeeds();
