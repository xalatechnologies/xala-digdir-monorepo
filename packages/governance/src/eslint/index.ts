/**
 * ESLint rules and configuration for Xala governance.
 *
 * Rules:
 * - no-banned-terms: Prevents domain-specific terminology in platform code
 * - no-server-imports: Prevents server-only imports in universal code
 * - no-raw-fetch: Prevents direct fetch/axios calls (SDK-first)
 * - no-hardcoded-strings: Enforces pure i18n
 * - designsystemet-v1-api: Enforces Designsystemet v1.x props
 */

import noBannedTerms from './rules/no-banned-terms.js';
import noServerImports from './rules/no-server-imports.js';
import noRawFetch from './rules/no-raw-fetch.js';
import noHardcodedStrings from './rules/no-hardcoded-strings.js';
import { noRawHtmlElements } from './rules/no-raw-html-elements.js';
import noAppLevelStyles from './rules/no-app-level-styles.js';
import designsystemetV1Api from './rules/designsystemet-v1-api.js';
import { noDomainTerms } from './rules/no-domain-terms.js';
import { noCrossLayerImports } from './rules/no-cross-layer-imports.js';
import { noDeepImports } from './rules/no-deep-imports.js';
import { noHardcodedDesignValues } from './rules/no-hardcoded-design-values.js';
import { noEmojis } from './rules/no-emojis.js';

/**
 * All governance ESLint rules
 */
export const rules = {
  'no-banned-terms': noBannedTerms,
  'no-server-imports': noServerImports,
  'no-raw-fetch': noRawFetch,
  'no-hardcoded-strings': noHardcodedStrings,
  'no-raw-html-elements': noRawHtmlElements,
  'no-app-level-styles': noAppLevelStyles,
  'designsystemet-v1-api': designsystemetV1Api,
  'no-domain-terms': noDomainTerms,
  'no-cross-layer-imports': noCrossLayerImports,
  'no-deep-imports': noDeepImports,
  'no-hardcoded-design-values': noHardcodedDesignValues,
  'no-emojis': noEmojis,
};

/**
 * Recommended ESLint configuration for governance rules
 */
export const configs = {
  /**
   * Recommended config for all platform code
   */
  recommended: {
    plugins: ['@xala-technologies/governance'],
    rules: {
      '@xala-technologies/governance/no-banned-terms': 'error',
      '@xala-technologies/governance/no-server-imports': 'error',
      '@xala-technologies/governance/no-domain-terms': 'error',
      '@xala-technologies/governance/no-deep-imports': 'error',
    },
  },

  /**
   * UI-specific config for packages/platform/src/ui
   */
  ui: {
    plugins: ['@xala-technologies/governance'],
    rules: {
      '@xala-technologies/governance/no-banned-terms': 'error',
      '@xala-technologies/governance/no-raw-fetch': 'error',
      '@xala-technologies/governance/no-hardcoded-strings': 'warn',
      '@xala-technologies/governance/no-raw-html-elements': 'error',
      '@xala-technologies/governance/designsystemet-v1-api': 'error',
      '@xala-technologies/governance/no-domain-terms': 'error',
      '@xala-technologies/governance/no-cross-layer-imports': 'error',
      '@xala-technologies/governance/no-deep-imports': 'error',
    },
  },

  /**
   * Thin app config for apps/* directories
   */
  'thin-app': {
    plugins: ['@xala-technologies/governance'],
    rules: {
      '@xala-technologies/governance/no-banned-terms': 'error',
      '@xala-technologies/governance/no-raw-fetch': 'error',
      '@xala-technologies/governance/no-hardcoded-strings': 'warn',
      '@xala-technologies/governance/no-raw-html-elements': 'error',
      '@xala-technologies/governance/no-app-level-styles': 'error',
      '@xala-technologies/governance/designsystemet-v1-api': 'error',
      '@xala-technologies/governance/no-server-imports': 'error',
    },
  },
};

export {
  noBannedTerms,
  noServerImports,
  noRawFetch,
  noHardcodedStrings,
  noRawHtmlElements,
  noAppLevelStyles,
  designsystemetV1Api,
  noDomainTerms,
  noCrossLayerImports,
  noDeepImports,
};
