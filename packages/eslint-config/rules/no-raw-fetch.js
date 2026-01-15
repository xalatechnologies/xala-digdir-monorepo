/**
 * ESLint Rule: no-raw-fetch
 * Disallow raw fetch() calls in app code - use SDK services instead
 * 
 * This rule enforces SDK-first consumption pattern where apps must use
 * @digilist/client-sdk services instead of direct fetch() calls.
 * 
 * Usage in eslint.config.js:
 * ```js
 * import noRawFetch from '@digilist/eslint-config/rules/no-raw-fetch';
 * 
 * export default [
 *   {
 *     plugins: { custom: { rules: { 'no-raw-fetch': noRawFetch } } },
 *     rules: { 'custom/no-raw-fetch': 'error' },
 *   },
 * ];
 * ```
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw fetch() calls in app code - use @digilist/client-sdk services',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noRawFetch: 'Use SDK services from @digilist/client-sdk instead of raw fetch(). Import the appropriate service (e.g., rentalObjectService, bookingService) for API calls.',
      noAxios: 'Use SDK services from @digilist/client-sdk instead of axios. Import the appropriate service for API calls.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'File path patterns where raw fetch is allowed (e.g., SDK internals)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();
    const options = context.options[0] || {};
    const allowedPatterns = options.allowedPatterns || [
      'client-sdk',
      'apps/api',
      '__tests__',
      '.test.',
      '.spec.',
    ];

    function isAllowedFile() {
      return allowedPatterns.some(pattern => filename.includes(pattern));
    }

    function isExternalApiCall(node) {
      const parent = node.parent;
      
      if (parent && parent.type === 'CallExpression') {
        const args = parent.arguments;
        if (args.length > 0 && args[0].type === 'Literal') {
          const url = String(args[0].value);
          if (
            url.startsWith('https://') ||
            url.startsWith('http://') ||
            url.includes('external') ||
            url.includes('cdn') ||
            url.includes('googleapis') ||
            url.includes('mapbox')
          ) {
            return true;
          }
        }
      }
      return false;
    }

    return {
      CallExpression(node) {
        if (isAllowedFile()) {
          return;
        }

        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'fetch'
        ) {
          if (!isExternalApiCall(node.callee)) {
            context.report({
              node,
              messageId: 'noRawFetch',
            });
          }
        }

        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'window' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'fetch'
        ) {
          context.report({
            node,
            messageId: 'noRawFetch',
          });
        }

        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'axios'
        ) {
          context.report({
            node,
            messageId: 'noAxios',
          });
        }

        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'axios'
        ) {
          context.report({
            node,
            messageId: 'noAxios',
          });
        }
      },

      ImportDeclaration(node) {
        if (isAllowedFile()) {
          return;
        }

        if (node.source.value === 'axios') {
          context.report({
            node,
            messageId: 'noAxios',
          });
        }
      },
    };
  },
};
