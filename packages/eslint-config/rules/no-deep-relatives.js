/**
 * ESLint Rule: no-deep-relatives
 * Disallow deep relative imports (3+ levels up)
 * 
 * Deep relative imports like '../../../something' should use path aliases.
 * This improves maintainability and prevents refactoring issues.
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow deep relative imports (3+ parent traversals)',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // We suggest, can't auto-fix without knowing aliases
    messages: {
      tooDeepRelative: 'Avoid deep relative imports ({{ depth }} levels). Consider using a path alias like @/ or @xala/*.',
      suggestAlias: 'Import from "{{ importPath }}" is {{ depth }} levels deep. Use path aliases for better maintainability.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxDepth: {
            type: 'integer',
            minimum: 1,
            default: 2,
            description: 'Maximum allowed parent traversals (default: 2, so ../../../ would error)',
          },
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Patterns to ignore (e.g., test files)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const maxDepth = options.maxDepth ?? 2;
    const allowedPatterns = options.allowedPatterns || [
      '.test.',
      '.spec.',
      '.stories.',
      '__tests__',
      '__mocks__',
    ];

    const filename = context.getFilename();

    function isAllowedFile() {
      return allowedPatterns.some(pattern => filename.includes(pattern));
    }

    function countParentTraversals(importPath) {
      const matches = importPath.match(/\.\.\//g);
      return matches ? matches.length : 0;
    }

    return {
      ImportDeclaration(node) {
        if (isAllowedFile()) {
          return;
        }

        const importPath = node.source.value;
        
        // Only check relative imports
        if (!importPath.startsWith('.')) {
          return;
        }

        const depth = countParentTraversals(importPath);

        if (depth > maxDepth) {
          context.report({
            node,
            messageId: 'suggestAlias',
            data: { 
              importPath,
              depth: depth.toString(),
            },
          });
        }
      },

      // Also check dynamic imports
      CallExpression(node) {
        if (isAllowedFile()) {
          return;
        }

        // Check for import() calls
        if (node.callee.type !== 'Import') {
          return;
        }

        const arg = node.arguments[0];
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string') {
          return;
        }

        const importPath = arg.value;
        
        if (!importPath.startsWith('.')) {
          return;
        }

        const depth = countParentTraversals(importPath);

        if (depth > maxDepth) {
          context.report({
            node,
            messageId: 'suggestAlias',
            data: { 
              importPath,
              depth: depth.toString(),
            },
          });
        }
      },
    };
  },
};
