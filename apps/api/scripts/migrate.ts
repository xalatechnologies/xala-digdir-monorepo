/**
 * Database Migration Script
 *
 * Supports multiple migration strategies:
 * 1. Drizzle Kit migrations (if ./drizzle folder exists)
 * 2. Raw SQL migrations (from ./src/database/migrations)
 * 3. Feature flags catalog seeding (automatic)
 *
 * Usage:
 *   pnpm db:migrate              # Run migrations
 *   pnpm db:migrate --seed-only  # Only seed feature flags
 *   pnpm db:migrate --validate   # Validate setup (no database required)
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../src/database/schema/index';
import { seedFeatureFlags, FEATURE_FLAGS } from '../src/database/seeds/feature-flags.seed';

const DRIZZLE_MIGRATIONS_FOLDER = './drizzle';
const SQL_MIGRATIONS_FOLDER = './src/database/migrations';

async function runSqlMigration(sql: postgres.Sql, filePath: string): Promise<void> {
  const content = readFileSync(filePath, 'utf-8');
  console.log(`  📄 Running: ${filePath}`);
  await sql.unsafe(content);
}

async function runSqlMigrations(sql: postgres.Sql): Promise<number> {
  const migrationsPath = resolve(SQL_MIGRATIONS_FOLDER);

  if (!existsSync(migrationsPath)) {
    console.log('  ℹ️  No SQL migrations folder found');
    return 0;
  }

  const files = readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Ensure alphabetical order (timestamp-prefixed)

  if (files.length === 0) {
    console.log('  ℹ️  No SQL migration files found');
    return 0;
  }

  for (const file of files) {
    await runSqlMigration(sql, join(migrationsPath, file));
  }

  return files.length;
}

async function runDrizzleMigrations(databaseUrl: string): Promise<boolean> {
  if (!existsSync(DRIZZLE_MIGRATIONS_FOLDER)) {
    console.log('  ℹ️  No Drizzle migrations folder found');
    console.log('  💡 Run "pnpm db:generate" to create Drizzle migrations');
    return false;
  }
import { logger } from '../src/core/logger';

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  logger.info('🔄 Starting database migration...\n');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    await migrate(db, { migrationsFolder: DRIZZLE_MIGRATIONS_FOLDER });
    console.log('  ✅ Drizzle migrations completed');
    return true;
  } finally {
    await sql.end();
  }
}

/**
 * Validate mode - checks all migration files and seeds without requiring database
 */
async function runValidation(): Promise<void> {
  console.log('');
  console.log('='.repeat(60));
  console.log(' Migration Validation (--validate mode)');
  console.log('='.repeat(60));
  console.log('');

  let errors = 0;

  // Check SQL migrations
  console.log('📄 Checking SQL migrations...');
  const migrationsPath = resolve(SQL_MIGRATIONS_FOLDER);

  if (!existsSync(migrationsPath)) {
    console.log('  ⚠️  No SQL migrations folder found');
  } else {
    const files = readdirSync(migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('  ⚠️  No SQL migration files found');
    } else {
      for (const file of files) {
        const filePath = join(migrationsPath, file);
        try {
          const content = readFileSync(filePath, 'utf-8');
          // Basic SQL validation - check it's not empty and has some SQL-like content
          if (content.trim().length === 0) {
            console.log(`  ❌ ${file}: Empty file`);
            errors++;
          } else if (!content.includes('CREATE') && !content.includes('ALTER') && !content.includes('INSERT')) {
            console.log(`  ⚠️  ${file}: May not contain valid DDL statements`);
          } else {
            console.log(`  ✅ ${file}: Valid (${content.split('\n').length} lines)`);
          }
        } catch (err) {
          console.log(`  ❌ ${file}: Cannot read file`);
          errors++;
        }
      }
    }
  }

  // Check Drizzle migrations
  console.log('');
  console.log('📦 Checking Drizzle migrations...');
  if (!existsSync(DRIZZLE_MIGRATIONS_FOLDER)) {
    console.log('  ℹ️  No Drizzle migrations folder (using SQL migrations instead)');
  } else {
    console.log('  ✅ Drizzle migrations folder exists');
  }

  // Check feature flags seed
  console.log('');
  console.log('🚩 Checking feature flags seed...');
  try {
    const categories = [...new Set(FEATURE_FLAGS.map(f => f.category))];
    const modules = FEATURE_FLAGS.filter(f => f.category === 'module').length;
    const integrations = FEATURE_FLAGS.filter(f => f.category === 'integration').length;
    const policies = FEATURE_FLAGS.filter(f => f.category === 'policy').length;

    console.log(`  ✅ ${FEATURE_FLAGS.length} feature flags defined`);
    console.log(`     - Modules: ${modules}`);
    console.log(`     - Integrations: ${integrations}`);
    console.log(`     - Policies: ${policies}`);

    // Validate each flag has required fields
    for (const flag of FEATURE_FLAGS) {
      if (!flag.key || !flag.name || !flag.category) {
        console.log(`  ❌ Invalid flag: ${flag.key || 'unnamed'}`);
        errors++;
      }
    }
  } catch (err) {
    console.log(`  ❌ Feature flags seed error: ${err}`);
    errors++;
  }

  // Check schema exports
  console.log('');
  console.log('📊 Checking schema exports...');
  const requiredTables = ['featureFlagsCatalog', 'tenantFeatureFlags', 'orgFeatureFlags', 'plans', 'brandingTokens'];
  for (const table of requiredTables) {
    if (table in schema) {
      console.log(`  ✅ ${table}`);
    } else {
      console.log(`  ❌ ${table}: Missing from schema`);
      errors++;
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  if (errors === 0) {
    console.log(' ✅ Validation passed! Ready to run migrations.');
    console.log('');
    console.log(' To run actual migrations:');
    console.log('   export DATABASE_URL="postgresql://user:pass@localhost:5432/digilist"');
    console.log('   pnpm db:migrate');
  } else {
    console.log(` ❌ Validation failed with ${errors} error(s)`);
  }
  console.log('='.repeat(60));
  console.log('');

  process.exit(errors > 0 ? 1 : 0);
}

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  const seedOnly = process.argv.includes('--seed-only');
  const validateOnly = process.argv.includes('--validate');

  // Validate mode - no database required
  if (validateOnly) {
    await runValidation();
    return;
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('');
    console.error('Example:');
    console.error('  export DATABASE_URL="postgresql://user:pass@localhost:5432/digilist"');
    console.error('');
    console.error('For validation only (no database):');
    console.error('  pnpm db:migrate --validate');
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(' Database Migration');
  console.log('='.repeat(60));
  console.log('');

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    if (!seedOnly) {
      // Step 1: Try Drizzle migrations first
      console.log('📦 Step 1: Drizzle Migrations');
      const drizzleRan = await runDrizzleMigrations(databaseUrl);

      // Step 2: Run SQL migrations (idempotent, safe to run multiple times)
      console.log('');
      console.log('📄 Step 2: SQL Migrations');
      const sqlCount = await runSqlMigrations(sql);

      if (sqlCount > 0) {
        console.log(`  ✅ ${sqlCount} SQL migration(s) completed`);
      }

      if (!drizzleRan && sqlCount === 0) {
        console.log('');
        console.log('💡 Tip: Use "pnpm db:push" to sync schema directly (dev mode)');
      }
    }

    // Step 3: Seed feature flags
    console.log('');
    console.log('🚩 Step 3: Feature Flags Seed');
    const seedResult = await seedFeatureFlags(databaseUrl);
    console.log(`  ✅ Feature flags: ${seedResult.inserted} inserted, ${seedResult.updated} updated`);

    console.log('');
    console.log('='.repeat(60));
    console.log(' Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error);
    // Run migrations from drizzle folder
    await migrate(db, { migrationsFolder: './drizzle' });
    logger.info('✅ Migrations completed successfully');
  } catch (error) {
    logger.error({ error }, '❌ Migration failed');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
