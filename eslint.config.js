import { guardrails, digdirScanner, typescript } from './packages/eslint-config/index.js';

export default [
  ...typescript,
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
