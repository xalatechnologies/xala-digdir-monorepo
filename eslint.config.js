import { guardrails, digdirScanner } from './packages/eslint-config/index.js';

export default [
  ...guardrails,
  ...digdirScanner,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
];
