/**
 * ESLint Rule: no-deep-imports
 * 
 * Prevents deep imports that bypass package export boundaries.
 * All imports must use stable subpath exports.
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xalatechnologies/platform/blob/main/docs/rules/${name}.md`
);

const FORBIDDEN_PATTERNS = [
  {
    pattern: /\/src\//,
    message: 'Cannot import from /src/ directly. Use package exports.',
  },
  {
    pattern: /\/dist\//,
    message: 'Cannot import from /dist/ directly. Use package exports.',
  },
  {
    pattern: /@digilist\//,
    message: 'Platform code cannot import from domain packages (@digilist/*).',
  },
];

export const noDeepImports = createRule({
  name: 'no-deep-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent deep imports that bypass export boundaries',
    },
    messages: {
      deepImport: '{{message}} Import: "{{importPath}}"',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        
        if (typeof importPath !== 'string') {
          return;
        }
        
        for (const { pattern, message } of FORBIDDEN_PATTERNS) {
          if (pattern.test(importPath)) {
            context.report({
              node,
              messageId: 'deepImport',
              data: {
                message,
                importPath,
              },
            });
          }
        }
      },
    };
  },
});
