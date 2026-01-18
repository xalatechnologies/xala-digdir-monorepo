import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { rules as digdirRules } from './rules/index.js';

// Digdir Design System ESLint Plugin
export const digdirPlugin = {
  meta: {
    name: '@xala/eslint-plugin-digdir',
    version: '1.0.0',
  },
  rules: digdirRules,
};

export const base = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLLabelElement: 'readonly',
        Element: 'readonly',
        MutationObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        clearTimeout: 'readonly',
        setTimeout: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

// TypeScript configuration
export const typescript = [
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
    },
  },
];

// Repository-wide guardrails (import restrictions)
export const guardrails = [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@digdir/designsystemet-css'],
              message: "Do not import Designsystemet CSS directly. Import '@xala/ds/styles' instead.",
            },
            {
              group: ['@digdir/designsystemet-theme'],
              message: "Do not import theme CSS directly. Use @xala/ds DesignsystemetProvider to switch themes.",
            },
            {
              group: ['@xala/ds-themes'],
              message: "@xala/ds-themes is internal infrastructure. Use theme API from '@xala/ds' instead (ThemeProvider, useTheme).",
            },
            {
              group: ['@xala/ds-registry'],
              message: "@xala/ds-registry is for documentation only. Import components from '@xala/ds' instead.",
            },
            {
              group: ['@xala/platform'],
              message: "@xala/platform is DEPRECATED. Use '@xala/contracts' instead. This package will be removed in v2.0.0.",
            },
          ],
        },
      ],
    },
  },
  {
    // Allow theme imports ONLY in packages/ds/src/provider.tsx and styles.ts
    files: ['packages/ds/src/styles.ts', 'packages/ds/src/provider.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Allow ds-themes imports ONLY within ds-registry examples
    files: ['packages/ds-registry/examples/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];

// Digdir design token rules configuration
export const designTokens = [
  {
    files: ['**/*.{tsx,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    plugins: {
      digdir: digdirPlugin,
    },
    rules: {
      'digdir/no-hardcoded-colors': 'error',
      'digdir/no-hardcoded-spacing': 'warn',
      'digdir/no-hardcoded-typography': 'warn',
      'digdir/no-hardcoded-border-radius': 'warn',
    },
  },
];

// Digdir component pattern rules configuration
export const componentPatterns = [
  {
    files: ['**/*.{tsx,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    plugins: {
      digdir: digdirPlugin,
    },
    rules: {
      'digdir/as-child-single-child': 'error',
      'digdir/require-button-type': 'error',
      'digdir/require-interactive-labels': 'warn',
    },
  },
];

// Digdir component usage suggestions
export const componentSuggestions = [
  {
    files: ['apps/**/*.{tsx,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    plugins: {
      digdir: digdirPlugin,
    },
    rules: {
      'digdir/prefer-ds-components': 'warn',
      'digdir/require-provider': 'warn',
    },
  },
];

// Complete Digdir scanner configuration (all rules)
export const digdirScanner = [
  ...designTokens,
  ...componentPatterns,
  ...componentSuggestions,
];

// API-specific ACL enforcement rules
export const apiAclRules = [
  {
    files: ['apps/api/src/**/*.controller.{ts,tsx}', 'apps/api/src/modules/**/*.{ts,tsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    plugins: {
      digdir: digdirPlugin,
    },
    rules: {
      'digdir/no-direct-schema-import': 'error',
    },
  },
];

// App-specific rules (includes guardrails + scanner + TypeScript)
export const apps = [
  ...base,
  ...typescript,
  ...guardrails,
  ...digdirScanner,
  ...apiAclRules,
  {
    files: ['apps/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    rules: {
      'no-console': ['error', { allow: ['error'] }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@digdir/*'],
              message: "Do not import Digdir packages directly in apps. Use '@xala/ds'.",
            },
          ],
        },
      ],
    },
  },
  {
    // Ignore declaration files
    ignores: ['**/*.d.ts'],
  },
];

// Strict mode (all rules as errors)
export const strict = [
  {
    files: ['**/*.{tsx,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    plugins: {
      digdir: digdirPlugin,
    },
    rules: {
      'digdir/no-hardcoded-colors': 'error',
      'digdir/no-hardcoded-spacing': 'error',
      'digdir/no-hardcoded-typography': 'error',
      'digdir/no-hardcoded-border-radius': 'error',
      'digdir/as-child-single-child': 'error',
      'digdir/require-button-type': 'error',
      'digdir/require-interactive-labels': 'error',
      'digdir/prefer-ds-components': 'error',
      'digdir/require-provider': 'error',
    },
  },
];

// Export individual rules for custom configurations
export { digdirRules as rules };
