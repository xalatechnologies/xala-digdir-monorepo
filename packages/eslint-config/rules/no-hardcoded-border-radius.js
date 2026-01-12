/**
 * ESLint rule: no-hardcoded-border-radius
 * Prevents hardcoded border-radius values in style objects.
 * Enforces use of Digdir design tokens: var(--ds-border-radius-*)
 */

const HARDCODED_RADIUS_PATTERN = /^\d+(\.\d+)?(px|rem|em|%)$/i;

const RADIUS_PROPERTIES = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
];

const ALLOWED_VALUES = ['0', '0px', '50%', '100%', 'inherit', 'initial', 'unset', 'none'];

function isAllowedValue(value) {
  if (typeof value !== 'string') return true;
  if (value.includes('var(--')) return true;
  if (ALLOWED_VALUES.includes(value.toLowerCase())) return true;
  return false;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded border-radius values. Use Digdir tokens: var(--ds-border-radius-*)',
      category: 'Digdir Design Tokens',
      recommended: true,
    },
    messages: {
      noHardcodedRadius:
        "Hardcoded border-radius '{{value}}' detected in '{{property}}'. Use Digdir tokens: var(--ds-border-radius-sm), var(--ds-border-radius-md), var(--ds-border-radius-lg), var(--ds-border-radius-full).",
    },
    schema: [],
  },

  create(context) {
    function checkProperty(node, key, value) {
      if (!RADIUS_PROPERTIES.includes(key)) return;
      if (typeof value !== 'string') return;
      if (isAllowedValue(value)) return;

      // Check for shorthand values like "4px 8px"
      const parts = value.split(/\s+/);
      const hasHardcoded = parts.some((part) => HARDCODED_RADIUS_PATTERN.test(part));

      if (hasHardcoded) {
        context.report({
          node,
          messageId: 'noHardcodedRadius',
          data: { value, property: key },
        });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'style') return;
        if (!node.value || node.value.type !== 'JSXExpressionContainer') return;

        const expr = node.value.expression;
        if (expr.type !== 'ObjectExpression') return;

        for (const prop of expr.properties) {
          if (prop.type !== 'Property') continue;
          const key = prop.key.name || prop.key.value;
          if (prop.value.type === 'Literal') {
            checkProperty(prop, key, prop.value.value);
          }
        }
      },

      VariableDeclarator(node) {
        if (!node.init || node.init.type !== 'ObjectExpression') return;

        for (const prop of node.init.properties) {
          if (prop.type !== 'Property') continue;
          const key = prop.key.name || prop.key.value;
          if (prop.value.type === 'Literal') {
            checkProperty(prop, key, prop.value.value);
          }
        }
      },
    };
  },
};
