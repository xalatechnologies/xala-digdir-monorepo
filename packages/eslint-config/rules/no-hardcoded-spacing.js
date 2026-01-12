/**
 * ESLint rule: no-hardcoded-spacing
 * Prevents hardcoded spacing values in style objects.
 * Enforces use of Digdir design tokens: var(--ds-spacing-*)
 */

// Pixel values that are likely spacing (not 0, 1px borders, etc.)
const HARDCODED_SPACING_PATTERN = /^-?\d+(\.\d+)?(px|rem|em)$/i;

// Values that are allowed
const ALLOWED_VALUES = [
  '0',
  '0px',
  '1px', // Common for borders
  '-1px',
  '100%',
  '100vh',
  '100vw',
  '50%',
  'auto',
  'inherit',
  'initial',
  'unset',
  'none',
];

const SPACING_PROPERTIES = [
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingBlock',
  'paddingInline',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginBlock',
  'marginInline',
  'gap',
  'rowGap',
  'columnGap',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
];

function isAllowedValue(value) {
  if (typeof value !== 'string') return true;
  if (value.includes('var(--')) return true;
  if (ALLOWED_VALUES.includes(value.toLowerCase())) return true;
  // Allow calc() expressions
  if (value.toLowerCase().startsWith('calc(')) return true;
  return false;
}

function hasHardcodedSpacing(value) {
  if (typeof value !== 'string') return false;
  if (isAllowedValue(value)) return false;

  // Check for shorthand values like "8px 16px"
  const parts = value.split(/\s+/);
  return parts.some((part) => HARDCODED_SPACING_PATTERN.test(part));
}

// Threshold for pixel values to warn (small values might be intentional)
const PIXEL_THRESHOLD = 2;

function getPixelValue(value) {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(px)?$/i);
  if (match) return Math.abs(parseFloat(match[1]));
  return 0;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded spacing values. Use Digdir design tokens: var(--ds-spacing-*)',
      category: 'Digdir Design Tokens',
      recommended: true,
    },
    messages: {
      noHardcodedSpacing:
        "Hardcoded spacing '{{value}}' detected in '{{property}}'. Use Digdir tokens: var(--ds-spacing-0) through var(--ds-spacing-30).",
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            description: 'Minimum pixel value to warn about',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const threshold = options.threshold ?? PIXEL_THRESHOLD;

    function checkProperty(node, key, value) {
      if (!SPACING_PROPERTIES.includes(key)) return;
      if (typeof value !== 'string') return;
      if (!hasHardcodedSpacing(value)) return;

      // Skip small values below threshold
      const pixelVal = getPixelValue(value);
      if (pixelVal > 0 && pixelVal <= threshold) return;

      context.report({
        node,
        messageId: 'noHardcodedSpacing',
        data: { value, property: key },
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
