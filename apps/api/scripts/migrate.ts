/**
 * Database Migration Script
 * Push schema to PostgreSQL and generate migrations
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../src/database/schema/index';
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
