/**
 * ESLint Rule: use-platform-components
 *
 * Enforces use of platform composed components instead of custom implementations.
 * Prevents code duplication and ensures consistency.
 *
 * @example
 * // ❌ Bad - Custom Sidebar implementation
 * function Sidebar() {
 *   return <nav>...</nav>; // 400+ lines of custom code
 * }
 *
 * // ✅ Good - Use platform component
 * import { DashboardSidebar } from '@xala-technologies/platform/ui';
 * function Sidebar() {
 *   return <DashboardSidebar sections={sections} />;
 * }
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xala-technologies/platform/blob/main/docs/eslint-rules/${name}.md`
);

// Map of component names to their platform equivalents
const PLATFORM_COMPONENTS: Record<string, string> = {
  'Sidebar': 'DashboardSidebar',
  'Header': 'DashboardHeader',
  'Navigation': 'DashboardSidebar',
  'NavBar': 'DashboardHeader',
  'DataGrid': 'DataTable',
  'Table': 'DataTable (for complex tables)',
  'LoginForm': 'LoginPage',
  'AuthForm': 'LoginPage',
};

export const usePlatformComponents = createRule({
  name: 'use-platform-components',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce use of platform composed components instead of custom implementations',
    },
    messages: {
      usePlatformComponent: 'Custom "{{componentName}}" implementation detected. Use platform component: {{platformComponent}}',
      largeCustomComponent: 'Component "{{componentName}}" has {{lines}} lines. Consider using platform components or extracting to shared library.',
      missingPlatformImport: 'Import platform component: import { {{platformComponent}} } from \'@xala-technologies/platform/ui\'',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxComponentLines: {
            type: 'number',
            default: 150,
          },
          allowInPlatform: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      maxComponentLines: 150,
      allowInPlatform: true,
    },
  ],
  create(context) {
    const options = context.options[0] || {};
    const filename = context.getFilename();
    const sourceCode = context.getSourceCode();

    // Allow in platform package itself
    if (options.allowInPlatform && filename.includes('/packages/platform/')) {
      return {};
    }

    // Skip test and story files
    if (/\.(test|spec|stories)\.(ts|tsx|js|jsx)$/.test(filename)) {
      return {};
    }

    return {
      // Check function components
      FunctionDeclaration(node: any) {
        checkComponent(node, node.id?.name);
      },
      
      // Check arrow function components
      VariableDeclarator(node: any) {
        if (node.init?.type === 'ArrowFunctionExpression') {
          checkComponent(node.init, node.id?.name);
        }
      },
    };

    function checkComponent(node: any, componentName: string | undefined) {
      if (!componentName) return;

      // Check if component name matches a platform component
      const platformComponent = PLATFORM_COMPONENTS[componentName];
      
      if (platformComponent) {
        // Check if platform component is imported
        const imports = sourceCode.ast.body.filter((n: any) => n.type === 'ImportDeclaration');
        const hasPlatformImport = imports.some((imp: any) => 
          imp.source.value === '@xala-technologies/platform/ui' &&
          imp.specifiers.some((spec: any) => spec.imported?.name === platformComponent)
        );

        if (!hasPlatformImport) {
          context.report({
            node,
            messageId: 'usePlatformComponent',
            data: {
              componentName,
              platformComponent,
            },
          });
        }
      }

      // Check component size
      const startLine = node.loc.start.line;
      const endLine = node.loc.end.line;
      const lines = endLine - startLine + 1;

      if (lines > options.maxComponentLines) {
        context.report({
          node,
          messageId: 'largeCustomComponent',
          data: {
            componentName,
            lines: lines.toString(),
          },
        });
      }
    }
  },
});

export default usePlatformComponents;
