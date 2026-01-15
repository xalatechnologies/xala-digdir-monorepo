/**
 * Type declarations for import.meta.env
 * This provides TypeScript support for Vite's environment variables
 * without requiring the full vite/client types.
 */

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
