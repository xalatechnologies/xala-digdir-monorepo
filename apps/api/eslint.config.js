import { base } from '@xala/eslint-config';

export default [
  ...base,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
];
