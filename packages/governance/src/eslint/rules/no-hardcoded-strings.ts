/**
 * ESLint rule to prevent hardcoded strings in UI components.
 *
 * Enforces pure i18n by requiring all user-facing text to use translation hooks.
 */

import type { Rule } from 'eslint';


const UI_ELEMENTS = new Set([
    'Button',
    'Heading',
    'Paragraph',
    'Label',
    'Link',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'span',
    'a',
    'li',
    'th',
    'td',
    'title',
    'Alert',
    'Tag',
]);

const ALLOWED_PATTERNS = [
    /^\s*$/,           // Empty or whitespace
    /^[0-9.,+-]+$/,    // Numbers
    /^[•\-\*\|\/\\:;]+$/,  // Punctuation only
    /^[A-Z_]+$/,       // Constants (e.g., "USD", "API")
    /^\{.*\}$/,        // Template expressions
];

function isAllowedString(value: string): boolean {
    return ALLOWED_PATTERNS.some((pattern) => pattern.test(value));
}

const rule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow hardcoded strings in UI components (pure i18n)',
            recommended: true,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowedStrings: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            hardcodedString:
                'Hardcoded string "{{value}}" in {{element}}. Use translation hook: t("key") or useT()',
        },
    },

    create(context) {
        const options = context.options[0] || {};
        const allowedStrings = new Set(options.allowedStrings || []);

        return {
            JSXText(node: any) {
                const value = node.value.trim();

                if (!value || isAllowedString(value) || allowedStrings.has(value)) {
                    return;
                }

                const parent = node.parent;
                const elementName =
                    parent.openingElement?.name?.name || 'element';

                if (!UI_ELEMENTS.has(elementName)) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'hardcodedString',
                    data: {
                        value: value.length > 30 ? value.substring(0, 30) + '...' : value,
                        element: elementName,
                    },
                });
            },
        };
    },
};

export default rule;
