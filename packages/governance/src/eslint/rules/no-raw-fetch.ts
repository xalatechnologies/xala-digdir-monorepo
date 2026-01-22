/**
 * ESLint rule to prevent direct fetch/axios calls.
 *
 * Enforces SDK-first data access pattern.
 */

import type { Rule } from 'eslint';

const BANNED_FUNCTIONS = ['fetch', 'axios'];
const BANNED_IMPORTS = ['axios', 'node-fetch', 'cross-fetch', 'isomorphic-fetch'];

const rule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow direct fetch/axios calls (use SDK hooks)',
            recommended: true,
        },
        schema: [],
        messages: {
            noRawFetch: 'Direct {{name}}() calls are forbidden. Use SDK hooks from @xala-technologies/platform/sdk instead.',
            noFetchImport: 'Importing {{module}} is forbidden. Use SDK hooks from @xala-technologies/platform/sdk instead.',
        },
    },

    create(context) {
        return {
            // Check for fetch() or axios() calls
            CallExpression(node: any) {
                const callee = node.callee as any;

                // Direct fetch() call
                if (callee?.type === 'Identifier' && callee.name && BANNED_FUNCTIONS.includes(callee.name)) {
                    context.report({
                        node,
                        messageId: 'noRawFetch',
                        data: { name: callee.name },
                    });
                }

                // axios.get(), axios.post(), etc.
                if (
                    callee?.type === 'MemberExpression' &&
                    callee.object?.type === 'Identifier' &&
                    callee.object?.name === 'axios'
                ) {
                    context.report({
                        node,
                        messageId: 'noRawFetch',
                        data: { name: 'axios' },
                    });
                }
            },

            // Check for import statements
            ImportDeclaration(node: any) {
                const source = node.source.value;

                if (BANNED_IMPORTS.includes(source)) {
                    context.report({
                        node,
                        messageId: 'noFetchImport',
                        data: { module: source },
                    });
                }
            },
        };
    },
};

export default rule;
