/**
 * Digilist ESLint Configuration
 *
 * Uses @digilist/governance for platform rules.
 * Same rules as xala-platform for consistency.
 */
import storybook from "eslint-plugin-storybook";
import * as governance from "@digilist/governance/eslint";

/**
 * Governance plugin configured for flat config
 */
const governancePlugin = {
  plugins: {
    '@digilist/governance': {
      rules: governance.rules,
    },
  },
  rules: {
    // Architecture Rules
    '@digilist/governance/no-raw-html-elements': 'error',
    '@digilist/governance/no-app-level-styles': 'error',
    '@digilist/governance/no-cross-layer-imports': 'error',
    '@digilist/governance/no-deep-imports': 'error',

    // Design System Rules
    '@digilist/governance/designsystemet-v1-api': 'error',
    '@digilist/governance/no-hardcoded-design-values': 'error',
    '@digilist/governance/no-inline-styles': 'warn',
    '@digilist/governance/use-platform-components': 'error',

    // Icon & Emoji Rules (ZERO TOLERANCE)
    '@digilist/governance/no-emojis': 'error',

    // SDK Rules
    '@digilist/governance/no-raw-fetch': 'error',

    // Localization Rules
    '@digilist/governance/no-hardcoded-strings': 'warn',
    '@digilist/governance/no-hardcoded-text': 'warn',

    // Platform Purity Rules (relaxed for domain apps)
    '@digilist/governance/no-domain-terms': 'off', // Domain apps CAN have domain terms
    '@digilist/governance/no-banned-terms': 'warn',
    '@digilist/governance/no-domain-logic-in-platform': 'off', // Not applicable to domain

    // Server/Client Rules
    '@digilist/governance/no-server-imports': 'error',
  },
};

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    ...governancePlugin,
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
  ...storybook.configs["flat/recommended"],
];
