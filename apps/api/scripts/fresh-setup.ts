#!/usr/bin/env tsx
/**
 * Fresh Database Setup
 * Drops all tables and rebuilds from scratch with rental_object schema
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function freshSetup() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop all tables
    console.log('\n🗑️  Dropping all existing tables...');
    await client.query(sql`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `.queryChunks.join(''));
    console.log('✅ All tables dropped');

    // Run migrations
    console.log('\n📦 Running migrations...');
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: join(__dirname, '../drizzle') });
    console.log('✅ Migrations complete');

    console.log('\n✨ Fresh database setup complete!');
    console.log('📊 Schema is now using rental_objects (no listing references)');
    
  } catch (error) {
    console.error('❌ Error during fresh setup:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

freshSetup();
