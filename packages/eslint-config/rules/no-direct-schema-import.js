/**
 * ESLint Rule: no-direct-schema-import
 *
 * Prevents controllers from directly importing database schema files.
 * Enforces Anti-Corruption Layer (ACL) pattern by requiring controllers
 * to use ACL mappers instead of raw database types.
 *
 * @see /reports/DECOUPLED_ARCHITECTURE_PLAN.md
 *
 * ❌ Bad:
 * ```typescript
 * import { rentalObjects } from '../database/schema';
 * ```
 *
 * ✅ Good:
 * ```typescript
 * import { RentalObjectMapper } from '../acl/rental-objects/rental-object.mapper';
 * ```
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent direct database schema imports in controllers',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      schemaImport:
        'Direct schema imports are forbidden in controllers. Use ACL mappers instead.\n' +
        'Import from: apps/api/src/acl/{module}/{module}.mapper.ts\n' +
        'See: /reports/DECOUPLED_ARCHITECTURE_PLAN.md',
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        const filename = context.getFilename();

        // Only check files in controller directories
        const isController =
          filename.includes('/controllers/') ||
          filename.includes('/modules/') ||
          filename.endsWith('.controller.ts');

        if (!isController) {
          return;
        }

        // Check if importing from database schema
        const isSchemaImport =
          importSource.includes('/database/schema') ||
          importSource.includes('apps/api/src/database/schema') ||
          importSource === '../database/schema' ||
          importSource === '../../database/schema' ||
          importSource === '../../../database/schema';

        if (isSchemaImport) {
          context.report({
            node,
            messageId: 'schemaImport',
          });
        }
      },
    };
  },
};
