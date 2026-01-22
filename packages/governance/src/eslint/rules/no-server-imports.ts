/**
 * ESLint Rule: no-server-imports
 *
 * Prevents importing server-only packages in frontend/client applications.
 * This is the single most important "client-server architecture" safeguard.
 *
 * BANNED IMPORTS IN FRONTEND APPS:
 * - @xala-technologies/schema (database tables)
 * - @xala-technologies/enterprise/server (server-only enterprise features)
 * - Any /server subpath from platform packages
 *
 * FRONTEND APPS (where rule is enforced):
 * - apps/web
 * - apps/minside
 * - apps/backoffice
 * - apps/saas-admin
 * - apps/monitoring
 * - apps/docs-learning
 *
 * ALLOWED CONSUMERS (excluded from rule):
 * - apps/platform-api
 * - apps/api
 * - packages/** (except packages/ui, packages/runtime)
 */

import type { Rule } from 'eslint';

/**
 * Server-only import patterns that are banned in frontend apps
 */
const SERVER_ONLY_IMPORTS = [
  '@xala-technologies/schema',
  '@xala-technologies/enterprise/server',
  '@xala-technologies/platform/server',
  '@digilist/database-schema', // Domain schema is also server-only
];

/**
 * Patterns that indicate a file is in a frontend app
 */
const FRONTEND_APP_PATTERNS = [
  /apps\/web\//,
  /apps\/minside\//,
  /apps\/backoffice\//,
  /apps\/saas-admin\//,
  /apps\/monitoring\//,
  /apps\/docs-learning\//,
  /packages\/ui\//,        // UI package should not import server code
  /packages\/runtime\//,   // Runtime package should not import server code
];

/**
 * Check if a file path is in a frontend app
 */
function isInFrontendApp(filePath: string): boolean {
  return FRONTEND_APP_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if an import source is a server-only package
 */
function isServerOnlyImport(importSource: string): boolean {
  return SERVER_ONLY_IMPORTS.some(pkg =>
    importSource === pkg || importSource.startsWith(`${pkg}/`)
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing server-only packages in frontend applications',
      category: 'Architecture',
      recommended: true,
    },
    messages: {
      serverOnlyImport:
        "Import '{{source}}' is server-only and cannot be used in frontend apps. " +
        'Server-only packages (database schemas, server entrypoints) must only be imported in apps/api, apps/platform-api, or server-side packages.',
    },
    schema: [],
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    const filePath = context.filename || context.getFilename();

    // Skip if not in a frontend app
    if (!isInFrontendApp(filePath)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === 'string' && isServerOnlyImport(source)) {
          context.report({
            node: node.source,
            messageId: 'serverOnlyImport',
            data: { source },
          });
        }
      },

      CallExpression(node) {
        // Check for dynamic imports: import('...')
        // Note: In ESLint AST, dynamic import has callee.type === 'ImportExpression' or similar
        // but we check via callee identifier for broader compatibility
        const calleeType = (node.callee as { type: string }).type;
        if (
          calleeType === 'Import' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'string'
        ) {
          const source = node.arguments[0].value;
          if (isServerOnlyImport(source)) {
            context.report({
              node: node.arguments[0],
              messageId: 'serverOnlyImport',
              data: { source },
            });
          }
        }

        // Check for require('...')
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal' &&
          typeof node.arguments[0].value === 'string'
        ) {
          const source = node.arguments[0].value;
          if (isServerOnlyImport(source)) {
            context.report({
              node: node.arguments[0],
              messageId: 'serverOnlyImport',
              data: { source },
            });
          }
        }
      },
    };
  },
};

export default rule;
