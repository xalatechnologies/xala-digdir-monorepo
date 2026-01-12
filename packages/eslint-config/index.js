import js from '@eslint/js';

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
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

// Repository-wide guardrails
export const guardrails = [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
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
          ],
        },
      ],
    },
  },
  {
    // Allow theme CSS imports ONLY in packages/ds/src/styles.ts
    files: ['packages/ds/src/styles.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];

// App-specific rules
export const apps = [
  ...base,
  {
    files: ['apps/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    rules: {
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
];
