/**
 * ESLint rule: i18n-no-hardcoded-strings
 * Prevents hardcoded user-facing strings in JSX.
 * Enforces use of @xala/i18n translation functions for localization.
 */

// Attributes that typically contain user-facing text
const USER_FACING_ATTRIBUTES = [
  'title',
  'placeholder',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-placeholder',
  'alt',
  'label',
];

// Patterns that are allowed (not user-facing text)
const ALLOWED_PATTERNS = [
  // Empty strings
  /^$/,
  // Single characters (often used for separators)
  /^.$/,
  // Numbers only
  /^[\d.,\s]+$/,
  // URLs
  /^(https?:\/\/|\/|#)/,
  // CSS classes or IDs
  /^[\w-]+$/,
  // Email patterns
  /^[\w.@]+$/,
  // File extensions
  /^\.\w+$/,
  // Template expressions only (no text)
  /^\s*$/,
  // HTML entities
  /^&\w+;$/,
  // Pure punctuation
  /^[.,;:!?()[\]{}<>\/\-_+=*&^%$#@~`'"\\|]+$/,
  // Date/time format patterns
  /^(HH|hh|mm|ss|MM|DD|YYYY|YY|dd)[:\-./\s]*(HH|hh|mm|ss|MM|DD|YYYY|YY|dd)?$/i,
];

// Common technical strings that should be ignored
const TECHNICAL_STRINGS = [
  'id',
  'key',
  'ref',
  'type',
  'name',
  'value',
  'className',
  'style',
  'onClick',
  'onChange',
  'onSubmit',
  'src',
  'href',
  'data-testid',
  'data-cy',
  'role',
];

// Component names that typically don't need i18n (icons, layout, etc.)
const IGNORED_COMPONENTS = [
  'svg',
  'path',
  'rect',
  'circle',
  'line',
  'polyline',
  'polygon',
  'g',
  'defs',
  'mask',
  'use',
  'symbol',
  'clipPath',
  'linearGradient',
  'radialGradient',
  'stop',
  'pattern',
  'image',
  'style',
  'script',
  'meta',
  'link',
  'title', // HTML title element, not attribute
  'head',
];

// File patterns to skip (test files, configs, etc.)
const IGNORED_FILE_PATTERNS = [
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
  /\.stories\.(ts|tsx|js|jsx)$/,
  /\.config\.(ts|tsx|js|jsx|mjs|cjs)$/,
  /setupTests\.(ts|tsx|js|jsx)$/,
  /vitest\.setup\.(ts|tsx|js|jsx)$/,
  /__tests__\//,
  /__mocks__\//,
  /node_modules\//,
];

/**
 * Check if a value matches any allowed pattern
 */
function isAllowedValue(value) {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Check if string looks like user-facing text (contains words)
 */
function looksLikeUserFacingText(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();

  // Must contain at least one letter
  if (!/[a-zA-ZæøåÆØÅ]/.test(trimmed)) return false;

  // Must be more than one character
  if (trimmed.length <= 1) return false;

  // Check if it looks like actual words (has spaces or capital letters suggesting sentences)
  const hasMultipleWords = /\s/.test(trimmed);
  const startsWithCapital = /^[A-ZÆØÅ]/.test(trimmed);
  const hasLowercase = /[a-zæøå]/.test(trimmed);

  // If it has multiple words, it's likely user-facing
  if (hasMultipleWords) return true;

  // Single word starting with capital and having lowercase is likely a label
  if (startsWithCapital && hasLowercase && trimmed.length > 3) return true;

  return false;
}

/**
 * Get the parent component name
 */
function getParentComponentName(node) {
  let current = node;
  while (current) {
    if (current.type === 'JSXElement' && current.openingElement) {
      const element = current.openingElement;
      if (element.name.type === 'JSXIdentifier') {
        return element.name.name;
      }
    }
    current = current.parent;
  }
  return null;
}

/**
 * Check if node is inside an ignored component
 */
function isInsideIgnoredComponent(node) {
  const componentName = getParentComponentName(node);
  if (!componentName) return false;
  return IGNORED_COMPONENTS.includes(componentName.toLowerCase());
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded user-facing strings in JSX. Use @xala/i18n translation functions for localization.',
      category: 'Internationalization',
      recommended: true,
    },
    messages: {
      noHardcodedString:
        "Hardcoded string '{{value}}' detected. Use t('translation.key') from @xala/i18n for user-facing text.",
      noHardcodedAttributeString:
        "Hardcoded string in '{{attribute}}' attribute. Use t('translation.key') from @xala/i18n for user-facing text.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreComponents: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional components to ignore',
          },
          ignoreAttributes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional attributes to ignore',
          },
          ignorePatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional regex patterns for strings to ignore',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Skip ignored files
    if (IGNORED_FILE_PATTERNS.some((pattern) => pattern.test(filename))) {
      return {};
    }

    const options = context.options[0] || {};
    const ignoreComponents = [
      ...IGNORED_COMPONENTS,
      ...(options.ignoreComponents || []).map((c) => c.toLowerCase()),
    ];
    const ignoreAttributes = options.ignoreAttributes || [];
    const ignorePatterns = (options.ignorePatterns || []).map((p) => new RegExp(p));

    /**
     * Check if value should be ignored based on custom patterns
     */
    function shouldIgnoreValue(value) {
      if (isAllowedValue(value)) return true;
      if (ignorePatterns.some((pattern) => pattern.test(value))) return true;
      return false;
    }

    return {
      // Check JSX text content: <div>Hello World</div>
      JSXText(node) {
        const value = node.value;

        // Skip if inside ignored component
        if (isInsideIgnoredComponent(node)) return;

        // Skip whitespace-only or allowed patterns
        if (shouldIgnoreValue(value)) return;

        // Only report if it looks like user-facing text
        if (!looksLikeUserFacingText(value)) return;

        const trimmed = value.trim();
        const displayValue = trimmed.length > 50 ? trimmed.substring(0, 47) + '...' : trimmed;

        context.report({
          node,
          messageId: 'noHardcodedString',
          data: { value: displayValue },
        });
      },

      // Check JSX expression containers with string literals: <div>{"Hello World"}</div>
      JSXExpressionContainer(node) {
        const expr = node.expression;

        // Only check string literals
        if (expr.type !== 'Literal' || typeof expr.value !== 'string') return;

        // Skip if inside ignored component
        if (isInsideIgnoredComponent(node)) return;

        const value = expr.value;

        // Skip allowed patterns
        if (shouldIgnoreValue(value)) return;

        // Only report if it looks like user-facing text
        if (!looksLikeUserFacingText(value)) return;

        const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;

        context.report({
          node,
          messageId: 'noHardcodedString',
          data: { value: displayValue },
        });
      },

      // Check user-facing attributes: <input placeholder="Enter name" />
      JSXAttribute(node) {
        const attrName = node.name.type === 'JSXIdentifier' ? node.name.name : null;
        if (!attrName) return;

        // Skip if not a user-facing attribute
        if (!USER_FACING_ATTRIBUTES.includes(attrName)) return;

        // Skip if in custom ignore list
        if (ignoreAttributes.includes(attrName)) return;

        // Skip if inside ignored component
        if (isInsideIgnoredComponent(node)) return;

        // Check string literal value
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          const value = node.value.value;

          // Skip allowed patterns
          if (shouldIgnoreValue(value)) return;

          // Only report if it looks like user-facing text
          if (!looksLikeUserFacingText(value)) return;

          const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;

          context.report({
            node,
            messageId: 'noHardcodedAttributeString',
            data: { attribute: attrName, value: displayValue },
          });
        }

        // Check JSX expression container with string literal
        if (node.value && node.value.type === 'JSXExpressionContainer') {
          const expr = node.value.expression;
          if (expr.type === 'Literal' && typeof expr.value === 'string') {
            const value = expr.value;

            // Skip allowed patterns
            if (shouldIgnoreValue(value)) return;

            // Only report if it looks like user-facing text
            if (!looksLikeUserFacingText(value)) return;

            const displayValue = value.length > 50 ? value.substring(0, 47) + '...' : value;

            context.report({
              node,
              messageId: 'noHardcodedAttributeString',
              data: { attribute: attrName, value: displayValue },
            });
          }
        }
      },
    };
  },
};
