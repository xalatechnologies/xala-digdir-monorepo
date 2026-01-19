/**
 * Database Connection
 * 
 * Provides the Drizzle ORM database instance.
 * The actual connection is established in main.ts and this module
 * provides a way to access it from services.
 */

import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let dbInstance: PostgresJsDatabase<typeof schema> | null = null;

/**
 * Initialize the database connection
 * Called from main.ts during server startup
 */
export function initializeDatabase(databaseUrl: string): PostgresJsDatabase<typeof schema> {
  if (dbInstance) {
    return dbInstance;
  }

  const sql = postgres(databaseUrl, { max: 10 });
  dbInstance = drizzle(sql, { schema });
  return dbInstance;
}

/**
 * Get the database instance
 * Throws if not initialized
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Database instance (lazy initialized)
 * For backward compatibility with existing imports
 */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(target, prop) {
    const instance = getDb();
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Database = PostgresJsDatabase<typeof schema>;
