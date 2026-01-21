import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/digilist',
  },
  verbose: true,
  strict: true,
});
