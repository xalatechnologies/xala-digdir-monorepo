// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { guardrails, digdirScanner, typescript } from './packages/eslint-config/index.js';

export default [...typescript, ...guardrails, ...digdirScanner, {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.turbo/**',
    '**/coverage/**',
  ],
}, ...storybook.configs["flat/recommended"]];
