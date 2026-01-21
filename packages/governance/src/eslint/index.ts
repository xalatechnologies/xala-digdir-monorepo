/**
 * ESLint rules and configuration for Xala governance.
 */

import noBannedTerms from './rules/no-banned-terms.js';

/**
 * All governance ESLint rules
 */
export const rules = {
  'no-banned-terms': noBannedTerms,
};

/**
 * Recommended ESLint configuration for governance rules
 */
export const configs = {
  recommended: {
    plugins: ['@xalatechnologies/governance'],
    rules: {
      '@xalatechnologies/governance/no-banned-terms': 'error',
    },
  },
};

export { noBannedTerms };
