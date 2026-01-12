import { guardrails } from './packages/eslint-config/index.js';

export default [
  ...guardrails,
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
