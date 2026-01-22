/**
 * ESLint Rule: no-app-level-styles
 *
 * Prevents apps from defining their own CSS/themes.
 * Apps must import all styling from @xala-technologies/platform/ui
 *
 * @example
 * // ❌ Bad - apps should not have .css files
 * apps/backoffice/src/styles.css
 * apps/backoffice/public/themes/custom.css
 *
 * // ✅ Good - import from platform
 * import '@xala-technologies/platform/ui/themes/xala.css'
 */

import type { Rule } from 'eslint';
import * as path from 'path';

const FORBIDDEN_PATTERNS = [
  /apps\/[^/]+\/.*\.css$/,           // Any .css in apps/
  /apps\/[^/]+\/.*\.scss$/,          // Any .scss in apps/
  /apps\/[^/]+\/.*\.less$/,          // Any .less in apps/
  /apps\/[^/]+\/.*\.sass$/,          // Any .sass in apps/
  /apps\/[^/]+\/public\/themes\//,   // Theme directories in apps
  /apps\/[^/]+\/src\/styles\//,      // Style directories in apps
];

const ALLOWED_EXCEPTIONS = [
  /apps\/[^/]+\/.*\.module\.css$/,   // CSS modules are allowed
  /apps\/[^/]+\/.*\.test\.css$/,     // Test-specific styles
];

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent apps from defining their own CSS/themes - must import from platform/ui',
      recommended: true,
    },
    messages: {
      noAppStyles:
        'Apps must not define CSS/themes. Import from @xala-technologies/platform/ui instead. Found: {{file}}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Only check files in apps/ directories
    if (!filename.includes('/apps/')) {
      return {};
    }

    // Check if file matches forbidden patterns
    const isForbidden = FORBIDDEN_PATTERNS.some(pattern => pattern.test(filename));
    const isException = ALLOWED_EXCEPTIONS.some(pattern => pattern.test(filename));

    if (isForbidden && !isException) {
      return {
        Program(node: any) {
          context.report({
            node,
            messageId: 'noAppStyles',
            data: {
              file: path.relative(process.cwd(), filename),
            },
          });
        },
      };
    }

    // Also check for CSS imports in JS/TS files
    return {
      ImportDeclaration(node: any) {
        const source = node.source.value;
        
        // Check for relative CSS imports
        if (typeof source === 'string' && source.match(/\.(css|scss|less|sass)$/)) {
          // Allow imports from node_modules or platform package
          if (!source.startsWith('@xala-technologies/platform') && 
              !source.startsWith('@digdir/') &&
              source.startsWith('.')) {
            context.report({
              node,
              messageId: 'noAppStyles',
              data: {
                file: source,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
