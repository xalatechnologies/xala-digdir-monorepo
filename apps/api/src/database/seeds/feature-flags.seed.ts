/**
 * Feature Flags Catalog Seed Data
 *
 * This seed populates the feature_flags_catalog table with default flags
 * for the SaaS Control Room multi-tenant platform.
 *
 * Categories:
 * - module: Feature modules that can be enabled/disabled
 * - integration: Third-party integrations
 * - policy: Business policy settings
 *
 * Run: npx tsx apps/api/src/database/seeds/feature-flags.seed.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { featureFlagsCatalog } from '../schema/index';

// ============================================================================
// Feature Flag Definitions
// ============================================================================

interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number';
  defaultValue: boolean | string | number;
  category: 'module' | 'integration' | 'policy';
  metadata?: Record<string, unknown>;
}

const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  // =========================================================================
  // MODULE FLAGS
  // =========================================================================
  {
    key: 'module.rating',
    name: 'Rating & Reviews',
    description: 'Enable rating and review system for listings. Users can rate their booking experience and leave reviews.',
    type: 'boolean',
    defaultValue: false,
    category: 'module',
    metadata: {
      requiresPlan: 'pro',
      dependencies: [],
    },
  },
  {
    key: 'module.recommendations',
    name: 'AI Recommendations',
    description: 'Enable AI-powered recommendations for listings based on user preferences and booking history.',
    type: 'boolean',
    defaultValue: false,
    category: 'module',
    metadata: {
      requiresPlan: 'enterprise',
      dependencies: [],
    },
  },
  {
    key: 'module.feedback',
    name: 'Feedback Collection',
    description: 'Enable feedback collection forms after bookings. Helps improve service quality.',
    type: 'boolean',
    defaultValue: true,
    category: 'module',
    metadata: {
      requiresPlan: 'free',
      dependencies: [],
    },
  },
  {
    key: 'module.favorites',
    name: 'Favorites & Wishlist',
    description: 'Allow users to save listings to their favorites/wishlist for quick access.',
    type: 'boolean',
    defaultValue: true,
    category: 'module',
    metadata: {
      requiresPlan: 'free',
      dependencies: [],
    },
  },
  {
    key: 'module.share',
    name: 'Social Sharing',
    description: 'Enable social sharing features for listings. Users can share via email, SMS, or social media.',
    type: 'boolean',
    defaultValue: true,
    category: 'module',
    metadata: {
      requiresPlan: 'free',
      dependencies: [],
    },
  },
  {
    key: 'module.recurring_bookings',
    name: 'Recurring Bookings',
    description: 'Allow users to create recurring booking patterns (daily, weekly, monthly). Useful for regular activities.',
    type: 'boolean',
    defaultValue: false,
    category: 'module',
    metadata: {
      requiresPlan: 'pro',
      dependencies: [],
    },
  },

  // =========================================================================
  // INTEGRATION FLAGS
  // =========================================================================
  {
    key: 'integration.visma',
    name: 'Visma Business',
    description: 'Enable Visma Business integration for financial reporting and invoicing.',
    type: 'boolean',
    defaultValue: false,
    category: 'integration',
    metadata: {
      requiresPlan: 'enterprise',
      prerequisites: ['API credentials from Visma', 'Test environment access'],
      documentationUrl: 'https://developer.visma.com/',
    },
  },
  {
    key: 'integration.rco',
    name: 'RCO Security',
    description: 'Enable RCO Security integration for access control systems (doors, locks).',
    type: 'boolean',
    defaultValue: false,
    category: 'integration',
    metadata: {
      requiresPlan: 'enterprise',
      prerequisites: ['IP whitelist required', 'Contact RCO administrator'],
      documentationUrl: 'https://www.rfrco.se/',
    },
  },
  {
    key: 'integration.acos',
    name: 'ACOS WebSak',
    description: 'Enable ACOS WebSak integration for Norwegian municipal case management.',
    type: 'boolean',
    defaultValue: false,
    category: 'integration',
    metadata: {
      requiresPlan: 'enterprise',
      prerequisites: ['Order integration from ACOS', 'Create template users'],
      documentationUrl: 'https://www.acos.no/',
    },
  },
  {
    key: 'integration.outlook',
    name: 'Outlook Calendar',
    description: 'Enable Microsoft Outlook calendar synchronization for booking management.',
    type: 'boolean',
    defaultValue: false,
    category: 'integration',
    metadata: {
      requiresPlan: 'pro',
      prerequisites: ['Azure AD app registration', 'Calendars.ReadWrite permission'],
      documentationUrl: 'https://learn.microsoft.com/en-us/graph/overview',
    },
  },
  {
    key: 'integration.vipps',
    name: 'Vipps MobilePay',
    description: 'Enable Vipps MobilePay payment integration for Norwegian mobile payments.',
    type: 'boolean',
    defaultValue: false,
    category: 'integration',
    metadata: {
      requiresPlan: 'pro',
      prerequisites: ['Vipps merchant account', 'API credentials'],
      documentationUrl: 'https://developer.vippsmobilepay.com/',
    },
  },

  // =========================================================================
  // POLICY FLAGS
  // =========================================================================
  {
    key: 'policy.require_approval',
    name: 'Require Booking Approval',
    description: 'Require manual approval for all bookings before confirmation. When disabled, bookings are auto-confirmed.',
    type: 'boolean',
    defaultValue: true,
    category: 'policy',
    metadata: {
      affectsWorkflow: true,
    },
  },
  {
    key: 'policy.org_delegation',
    name: 'Organization Delegation',
    description: 'Allow organization-level delegation of booking approval. Org admins can approve within their scope.',
    type: 'boolean',
    defaultValue: false,
    category: 'policy',
    metadata: {
      affectsWorkflow: true,
      dependencies: ['policy.require_approval'],
    },
  },
];

// ============================================================================
// Seed Runner
// ============================================================================

export async function seedFeatureFlags(databaseUrl?: string) {
  const dbUrl = databaseUrl || process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = postgres(dbUrl, { max: 1 });
  const db = drizzle(sql);

  try {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const flag of FEATURE_FLAGS) {
      // Check if flag already exists
      const existing = await db
        .select()
        .from(featureFlagsCatalog)
        .where(eq(featureFlagsCatalog.key, flag.key))
        .limit(1);

      if (existing.length > 0) {
        // Update existing flag (preserving ID)
        await db
          .update(featureFlagsCatalog)
          .set({
            name: flag.name,
            description: flag.description,
            type: flag.type,
            defaultValue: flag.defaultValue,
            category: flag.category,
            metadata: flag.metadata || {},
            updatedAt: new Date(),
          })
          .where(eq(featureFlagsCatalog.key, flag.key));
        updated++;
      } else {
        // Insert new flag
        await db.insert(featureFlagsCatalog).values({
          key: flag.key,
          name: flag.name,
          description: flag.description,
          type: flag.type,
          defaultValue: flag.defaultValue,
          category: flag.category,
          status: 'active',
          metadata: flag.metadata || {},
        });
        inserted++;
      }
    }

    return {
      total: FEATURE_FLAGS.length,
      inserted,
      updated,
      skipped,
    };
  } finally {
    await sql.end();
  }
}

// Export flag definitions for use in tests and other seeds
export { FEATURE_FLAGS };

// CLI Runner (ESM-compatible check)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  (async () => {
    process.stdout.write('\n');
    process.stdout.write('='.repeat(60) + '\n');
    process.stdout.write(' Feature Flags Catalog Seed\n');
    process.stdout.write('='.repeat(60) + '\n\n');

    try {
      const result = await seedFeatureFlags();

      process.stdout.write('Seed completed successfully!\n\n');
      process.stdout.write(`  Total flags:    ${result.total}\n`);
      process.stdout.write(`  Inserted:       ${result.inserted}\n`);
      process.stdout.write(`  Updated:        ${result.updated}\n`);
      process.stdout.write(`  Skipped:        ${result.skipped}\n`);
      process.stdout.write('\n');

      // List all flags by category
      process.stdout.write('Flags by category:\n');
      const categories = ['module', 'integration', 'policy'] as const;
      for (const category of categories) {
        const flags = FEATURE_FLAGS.filter((f) => f.category === category);
        process.stdout.write(`\n  ${category.toUpperCase()} (${flags.length}):\n`);
        for (const flag of flags) {
          const defaultStr = flag.defaultValue ? 'ON' : 'OFF';
          process.stdout.write(`    - ${flag.key}: ${defaultStr}\n`);
        }
      }

      process.stdout.write('\n');
      process.exit(0);
    } catch (error) {
      process.stderr.write(`Seed failed: ${error}\n`);
      process.exit(1);
    }
  })();
}
