/**
 * ESLint Rule: no-hardcoded-design-values
 *
 * Prevents hardcoded pixel values, hex colors, and other design values.
 * Enforces use of Designsystemet design tokens.
 *
 * @example
 * // ❌ Bad
 * <div style={{ padding: '16px', color: '#0066CC' }} />
 * const styles = { width: '100px', backgroundColor: '#FF0000' };
 *
 * // ✅ Good
 * <div style={{ padding: 'var(--ds-spacing-4)', color: 'var(--ds-color-accent-base-default)' }} />
 * const styles = { width: 'var(--ds-sizing-100)', backgroundColor: 'var(--ds-color-danger-base-default)' };
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xala-technologies/platform/blob/main/docs/eslint-rules/${name}.md`
);

// Patterns to detect violations
const HARDCODED_PX_REGEX = /\b\d+px\b/;
const HARDCODED_HEX_REGEX = /#[0-9A-Fa-f]{3,8}\b/;
const HARDCODED_RGB_REGEX = /rgba?\([^)]+\)/;
const HARDCODED_HSL_REGEX = /hsla?\([^)]+\)/;

// CSS properties that should use design tokens
const SPACING_PROPERTIES = new Set([
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'gap', 'rowGap', 'columnGap',
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'top', 'right', 'bottom', 'left',
  'borderRadius', 'borderWidth',
]);

const COLOR_PROPERTIES = new Set([
  'color', 'backgroundColor', 'borderColor', 'outlineColor',
  'fill', 'stroke', 'background', 'border', 'outline',
]);

// Allowed exceptions (design token fallbacks)
const ALLOWED_PATTERNS = [
  /var\(--ds-[^,)]+,\s*\d+px\)/, // Design token with px fallback
  /var\(--ds-[^,)]+,\s*#[0-9A-Fa-f]+\)/, // Design token with hex fallback
];

function isAllowedException(value: string): boolean {
  return ALLOWED_PATTERNS.some(pattern => pattern.test(value));
}

function getDesignTokenSuggestion(property: string, value: string): string {
  // Spacing suggestions
  if (SPACING_PROPERTIES.has(property)) {
    const pxMatch = value.match(/(\d+)px/);
    if (pxMatch) {
      const pixels = parseInt(pxMatch[1], 10);
      if (pixels % 4 === 0) {
        const spacing = pixels / 4;
        return `var(--ds-spacing-${spacing})`;
      }
      // Common sizing tokens
      if ([100, 200, 300, 400, 500].includes(pixels)) {
        return `var(--ds-sizing-${pixels})`;
      }
    }
    return 'var(--ds-spacing-*)';
  }

  // Color suggestions
  if (COLOR_PROPERTIES.has(property)) {
    if (value.includes('#')) {
      return 'var(--ds-color-*-*-default)';
    }
  }

  return 'var(--ds-*)';
}

export const noHardcodedDesignValues = createRule({
  name: 'no-hardcoded-design-values',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded design values (pixels, colors, etc.) - use design tokens',
    },
    messages: {
      hardcodedPixels: 'Hardcoded pixel value "{{value}}" detected. Use design token: {{suggestion}}',
      hardcodedColor: 'Hardcoded color "{{value}}" detected. Use design token: {{suggestion}}',
      useDesignToken: 'Use Designsystemet design tokens instead of hardcoded values',
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
    fixable: 'code',
  },
  defaultOptions: [{ allowInTests: true, allowInStories: true }],
  create(context) {
    const options = context.options[0] || {};
    const filename = context.getFilename();

    // Skip test and story files if allowed
    if (options.allowInTests && (filename.includes('.test.') || filename.includes('.spec.'))) {
      return {};
    }
    if (options.allowInStories && filename.includes('.stories.')) {
      return {};
    }

    return {
      // Check JSX style attributes
      JSXAttribute(node: any) {
        if (node.name.name === 'style' && node.value?.expression) {
          const styleObj = node.value.expression;
          
          if (styleObj.type === 'ObjectExpression') {
            styleObj.properties.forEach((prop: any) => {
              if (prop.type === 'Property' && prop.value.type === 'Literal') {
                const propName = prop.key.name || prop.key.value;
                const value = String(prop.value.value);

                // Skip if it's an allowed exception
                if (isAllowedException(value)) {
                  return;
                }

                // Check for hardcoded pixels
                if (HARDCODED_PX_REGEX.test(value)) {
                  context.report({
                    node: prop.value,
                    messageId: 'hardcodedPixels',
                    data: {
                      value,
                      suggestion: getDesignTokenSuggestion(propName, value),
                    },
                  });
                }

                // Check for hardcoded colors
                if (HARDCODED_HEX_REGEX.test(value) || 
                    HARDCODED_RGB_REGEX.test(value) || 
                    HARDCODED_HSL_REGEX.test(value)) {
                  context.report({
                    node: prop.value,
                    messageId: 'hardcodedColor',
                    data: {
                      value,
                      suggestion: getDesignTokenSuggestion(propName, value),
                    },
                  });
                }
              }
            });
          }
        }
      },

      // Check template literals in styled-components or CSS-in-JS
      TemplateLiteral(node: any) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText(node);

        // Skip if it's an allowed exception
        if (isAllowedException(text)) {
          return;
        }

        // Check for hardcoded pixels
        if (HARDCODED_PX_REGEX.test(text) && !text.includes('var(--ds-')) {
          context.report({
            node,
            messageId: 'hardcodedPixels',
            data: {
              value: text.match(HARDCODED_PX_REGEX)?.[0] || 'pixel value',
              suggestion: 'var(--ds-spacing-*) or var(--ds-sizing-*)',
            },
          });
        }

        // Check for hardcoded colors
        if ((HARDCODED_HEX_REGEX.test(text) || 
             HARDCODED_RGB_REGEX.test(text) || 
             HARDCODED_HSL_REGEX.test(text)) && 
            !text.includes('var(--ds-')) {
          context.report({
            node,
            messageId: 'hardcodedColor',
            data: {
              value: text.match(HARDCODED_HEX_REGEX)?.[0] || 'color value',
              suggestion: 'var(--ds-color-*-*-default)',
            },
          });
        }
      },
    };
  },
});

export default noHardcodedDesignValues;
