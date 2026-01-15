import { base, typescript } from '@xala/eslint-config';

export default [
  ...base,
  ...typescript,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
