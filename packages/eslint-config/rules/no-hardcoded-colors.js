/**
 * ESLint rule: no-hardcoded-colors
 * Prevents hardcoded color values in style objects and JSX.
 * Enforces use of Digdir design tokens: var(--ds-color-*)
 */

const COLOR_PATTERNS = [
  // Hex colors
  /#(?:[0-9a-fA-F]{3,4}){1,2}\b/,
  // RGB/RGBA
  /rgba?\s*\([^)]+\)/i,
  // HSL/HSLA
  /hsla?\s*\([^)]+\)/i,
  // Named colors (common ones)
  /\b(red|blue|green|yellow|orange|purple|pink|white|black|gray|grey|cyan|magenta|brown|navy|teal|maroon|olive|lime|aqua|fuchsia|silver)\b/i,
];

// Allowed patterns (CSS variables and inherit/transparent/currentColor)
const ALLOWED_PATTERNS = [
  /var\s*\(\s*--/,
  /^inherit$/i,
  /^transparent$/i,
  /^currentColor$/i,
  /^initial$/i,
  /^unset$/i,
  /^none$/i,
];

const COLOR_PROPERTIES = [
  'color',
  'backgroundColor',
  'background',
  'borderColor',
  'border',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'outline',
  'fill',
  'stroke',
  'boxShadow',
  'textShadow',
  'caretColor',
  'textDecorationColor',
  'columnRuleColor',
];

function isAllowedValue(value) {
  if (typeof value !== 'string') return true;
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(value));
}

function hasHardcodedColor(value) {
  if (typeof value !== 'string') return false;
  if (isAllowedValue(value)) return false;
  return COLOR_PATTERNS.some((pattern) => pattern.test(value));
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values. Use Digdir design tokens: var(--ds-color-*)',
      category: 'Digdir Design Tokens',
      recommended: true,
    },
    messages: {
      noHardcodedColor:
        "Hardcoded color '{{value}}' detected in '{{property}}'. Use Digdir design tokens: var(--ds-color-neutral-*), var(--ds-color-accent-*), var(--ds-color-brand1-*), etc.",
    },
    schema: [],
  },

  create(context) {
    return {
      // Check style={{ color: '#fff' }} patterns
      JSXAttribute(node) {
        if (node.name.name !== 'style') return;
        if (!node.value || node.value.type !== 'JSXExpressionContainer') return;

        const expr = node.value.expression;
        if (expr.type !== 'ObjectExpression') return;

        for (const prop of expr.properties) {
          if (prop.type !== 'Property') continue;
          const key = prop.key.name || prop.key.value;
          if (!COLOR_PROPERTIES.includes(key)) continue;

          if (prop.value.type === 'Literal' && hasHardcodedColor(prop.value.value)) {
            context.report({
              node: prop,
              messageId: 'noHardcodedColor',
              data: { value: prop.value.value, property: key },
            });
          }
          if (prop.value.type === 'TemplateLiteral') {
            for (const quasi of prop.value.quasis) {
              if (hasHardcodedColor(quasi.value.raw)) {
                context.report({
                  node: prop,
                  messageId: 'noHardcodedColor',
                  data: { value: quasi.value.raw, property: key },
                });
              }
            }
          }
        }
      },

      // Check variable declarations: const styles = { color: '#fff' }
      VariableDeclarator(node) {
        if (!node.init || node.init.type !== 'ObjectExpression') return;

        for (const prop of node.init.properties) {
          if (prop.type !== 'Property') continue;
          const key = prop.key.name || prop.key.value;
          if (!COLOR_PROPERTIES.includes(key)) continue;

          if (prop.value.type === 'Literal' && hasHardcodedColor(prop.value.value)) {
            context.report({
              node: prop,
              messageId: 'noHardcodedColor',
              data: { value: prop.value.value, property: key },
            });
          }
        }
      },
    };
  },
};
