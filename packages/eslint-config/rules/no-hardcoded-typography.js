/**
 * ESLint rule: no-hardcoded-typography
 * Prevents hardcoded typography values in style objects.
 * Enforces use of Digdir design tokens: var(--ds-font-*), var(--ds-font-size-*), etc.
 */

const HARDCODED_FONT_SIZE_PATTERN = /^\d+(\.\d+)?(px|rem|em|pt)$/i;
const HARDCODED_LINE_HEIGHT_PATTERN = /^\d+(\.\d+)?(px|rem|em|%)?$/;
const HARDCODED_FONT_WEIGHT_PATTERN = /^(100|200|300|400|500|600|700|800|900)$/;
const HARDCODED_FONT_FAMILY_PATTERN = /^["']?[A-Za-z\s-]+["']?(,|$)/;

const TYPOGRAPHY_PROPERTIES = {
  fontSize: {
    pattern: HARDCODED_FONT_SIZE_PATTERN,
    token: 'var(--ds-font-size-*)',
  },
  lineHeight: {
    pattern: HARDCODED_LINE_HEIGHT_PATTERN,
    token: 'var(--ds-font-line-height-*)',
  },
  fontWeight: {
    pattern: HARDCODED_FONT_WEIGHT_PATTERN,
    token: 'var(--ds-font-weight-*)',
  },
  fontFamily: {
    pattern: HARDCODED_FONT_FAMILY_PATTERN,
    token: 'var(--ds-font-family)',
  },
  letterSpacing: {
    pattern: /^-?\d+(\.\d+)?(px|em)$/i,
    token: 'var(--ds-font-letter-spacing-*)',
  },
};

// Values that are always allowed
const ALLOWED_VALUES = ['inherit', 'initial', 'unset', 'normal', 'none'];

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
        'Disallow hardcoded typography values. Use Digdir design tokens: var(--ds-font-*)',
      category: 'Digdir Design Tokens',
      recommended: true,
    },
    messages: {
      noHardcodedTypography:
        "Hardcoded typography value '{{value}}' detected in '{{property}}'. Use Digdir token: {{token}}.",
    },
    schema: [],
  },

  create(context) {
    function checkProperty(node, key, value) {
      const config = TYPOGRAPHY_PROPERTIES[key];
      if (!config) return;
      if (typeof value !== 'string' && typeof value !== 'number') return;

      const strValue = String(value);
      if (isAllowedValue(strValue)) return;
      if (!config.pattern.test(strValue)) return;

      context.report({
        node,
        messageId: 'noHardcodedTypography',
        data: { value: strValue, property: key, token: config.token },
      });
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
