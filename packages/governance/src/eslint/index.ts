/**
 * ESLint rules and configuration for Xala governance.
 *
 * Three-Layer Architecture Enforcement:
 * - Universal (isomorphic): Safe in browser + server
 * - Server-only: Node only (DB, secrets, DAL)
 * - Tooling-only: Not shipped to runtime
 */

import noBannedTerms from './rules/no-banned-terms.js';
import noServerImports from './rules/no-server-imports.js';

/**
 * All governance ESLint rules
 */
export const rules = {
  'no-banned-terms': noBannedTerms,
  'no-server-imports': noServerImports,
};

/**
 * Recommended ESLint configuration for governance rules
 */
export const configs = {
  recommended: {
    plugins: ['@xalatechnologies/governance'],
    rules: {
      '@xalatechnologies/governance/no-banned-terms': 'error',
      '@xalatechnologies/governance/no-server-imports': 'error',
    },
  },
};

export { noBannedTerms, noServerImports };
