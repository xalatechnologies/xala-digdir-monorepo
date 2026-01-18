/**
 * @deprecated
 * @xala/platform has been merged into @xala/contracts
 * 
 * Please update your imports:
 * 
 * Before:
 * import { validateEnv, webEnvSchema } from '@xala/platform';
 * 
 * After:
 * import { validateEnv, webEnvSchema } from '@xala/contracts';
 * 
 * This package will be removed in v2.0.0
 */

// Re-export everything from @xala/contracts for backward compatibility
export * from '@xala/contracts';

console.warn(
  '[@xala/platform] DEPRECATED: This package has been merged into @xala/contracts. ' +
  'Please update your imports to use @xala/contracts instead. ' +
  'This package will be removed in v2.0.0'
);
