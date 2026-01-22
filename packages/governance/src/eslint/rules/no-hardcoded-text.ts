/**
 * ESLint Rule: no-hardcoded-text
 *
 * Prevents hardcoded user-facing text in UI components.
 * Enforces use of i18n translation function.
 *
 * @example
 * // ❌ Bad
 * <Button>Save</Button>
 * <Heading>Dashboard</Heading>
 * <p>Welcome to the app</p>
 *
 * // ✅ Good
 * <Button>{t('action.save')}</Button>
 * <Heading>{t('page.dashboard')}</Heading>
 * <Paragraph>{t('welcome.message')}</Paragraph>
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xala-technologies/platform/blob/main/docs/eslint-rules/${name}.md`
);

// UI elements that should not contain hardcoded text
const UI_ELEMENTS = new Set([
  'Button',
  'Heading',
  'Paragraph',
  'Label',
  'Link',
  'Text',
  'Alert',
  'Tag',
  'Badge',
  'Chip',
  'MenuItem',
  'Tab',
  'Card',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'a', 'li', 'th', 'td',
  'title', 'label', 'option',
]);

// Allowed patterns (technical identifiers, not user-facing)
const ALLOWED_PATTERNS = [
  /^[A-Z_]+$/, // CONSTANTS
  /^\d+$/,     // Numbers only
  /^[a-z-]+$/, // kebab-case (likely IDs)
  /^\/[a-z/-]*$/, // Paths
];

export const noHardcodedText = createRule({
  name: 'no-hardcoded-text',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded user-facing text in UI components',
    },
    messages: {
      noHardcodedText: 'Hardcoded text "{{text}}" found. Use t() function for i18n: t(\'{{suggestion}}\')',
      missingI18nImport: 'Import useT hook: import { useT } from \'@xala-technologies/platform/i18n\'',
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
      JSXElement(node: any) {
        const elementName = node.openingElement.name.name;
        
        if (!UI_ELEMENTS.has(elementName)) {
          return;
        }

        // Check children for hardcoded text
        for (const child of node.children) {
          if (child.type === 'JSXText') {
            const text = child.value.trim();
            
            if (!text) continue;
            
            // Skip if matches allowed patterns
            if (ALLOWED_PATTERNS.some(pattern => pattern.test(text))) {
              continue;
            }
            
            // Skip if it's just whitespace or punctuation
            if (/^[\s.,!?;:]+$/.test(text)) {
              continue;
            }

            const suggestion = generateI18nKey(text, elementName);
            
            context.report({
              node: child,
              messageId: 'noHardcodedText',
              data: {
                text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
                suggestion,
              },
            });
          }
        }
      },

      // Check JSX attributes (aria-label, placeholder, title, etc.)
      JSXAttribute(node: any) {
        const attrName = node.name.name;
        const stringAttrs = ['aria-label', 'placeholder', 'title', 'alt'];
        
        if (!stringAttrs.includes(attrName)) {
          return;
        }

        if (node.value?.type === 'Literal' && typeof node.value.value === 'string') {
          const text = node.value.value;
          
          if (!text || ALLOWED_PATTERNS.some(pattern => pattern.test(text))) {
            return;
          }

          const suggestion = generateI18nKey(text, attrName);
          
          context.report({
            node: node.value,
            messageId: 'noHardcodedText',
            data: {
              text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
              suggestion,
            },
          });
        }
      },
    };
  },
});

/**
 * Generate suggested i18n key from text
 */
function generateI18nKey(text: string, context: string): string {
  // Convert to camelCase and create suggestion
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3) // Max 3 words
    .join('_');

  // Suggest namespace based on context
  const namespace = getNamespace(context);
  
  return `${namespace}.${cleaned}`;
}

function getNamespace(context: string): string {
  const namespaceMap: Record<string, string> = {
    'Button': 'action',
    'Heading': 'page',
    'h1': 'page',
    'h2': 'section',
    'Paragraph': 'content',
    'p': 'content',
    'Label': 'label',
    'label': 'label',
    'aria-label': 'ariaLabel',
    'placeholder': 'placeholder',
    'title': 'title',
    'Alert': 'message',
  };

  return namespaceMap[context] || 'common';
}

export default noHardcodedText;
