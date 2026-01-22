/**
 * ESLint Rule: no-inline-styles
 *
 * Prevents using inline style attributes in JSX.
 * Enforces use of design system components, className, or styled-components.
 *
 * @example
 * // ❌ Bad
 * <div style={{ display: 'flex', gap: '16px' }}>
 * <Button style={{ padding: '8px' }}>Click</Button>
 *
 * // ✅ Good
 * <Stack direction="horizontal" gap={4}>
 * <Button data-size="sm">Click</Button>
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xala-technologies/platform/blob/main/docs/eslint-rules/${name}.md`
);

export const noInlineStyles = createRule({
  name: 'no-inline-styles',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent inline style attributes in JSX',
    },
    messages: {
      noInlineStyles: 'Inline styles are not allowed. Use design system components, className, or styled-components instead.',
      useDesignSystemComponent: 'Use design system component instead: {{suggestion}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowInTests: {
            type: 'boolean',
            default: true,
          },
          allowInStories: {
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
      allowInTests: true,
      allowInStories: true,
    },
  ],
  create(context) {
    const options = context.options[0] || {};
    const filename = context.getFilename();

    // Allow in test files
    if (options.allowInTests && /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filename)) {
      return {};
    }

    // Allow in story files
    if (options.allowInStories && /\.stories\.(ts|tsx|js|jsx)$/.test(filename)) {
      return {};
    }

    return {
      JSXAttribute(node: any) {
        if (node.name.name === 'style') {
          // Check if it's an inline object
          if (node.value?.expression?.type === 'ObjectExpression') {
            const properties = node.value.expression.properties;
            
            // Suggest design system alternatives
            const suggestions = getSuggestions(properties);
            
            context.report({
              node,
              messageId: suggestions ? 'useDesignSystemComponent' : 'noInlineStyles',
              data: {
                suggestion: suggestions || '',
              },
            });
          }
        }
      },
    };
  },
});

/**
 * Analyze inline styles and suggest design system alternatives
 */
function getSuggestions(properties: any[]): string | null {
  const styleMap: Record<string, string> = {};
  
  for (const prop of properties) {
    if (prop.key?.name) {
      styleMap[prop.key.name] = true as any;
    }
  }

  // Detect common patterns and suggest alternatives
  if (styleMap.display === 'flex' || styleMap.flexDirection) {
    return 'Use <Stack> or <Grid> component';
  }
  
  if (styleMap.display === 'grid' || styleMap.gridTemplateColumns) {
    return 'Use <Grid> component';
  }
  
  if (styleMap.padding || styleMap.margin) {
    return 'Use spacing props on design system components';
  }
  
  if (styleMap.backgroundColor || styleMap.color) {
    return 'Use design system color tokens via className or data attributes';
  }

  return null;
}

export default noInlineStyles;
