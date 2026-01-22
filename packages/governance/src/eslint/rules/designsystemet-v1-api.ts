/**
 * ESLint rule to enforce Designsystemet v1.x API compliance.
 *
 * Prevents usage of deprecated size/color props in favor of data-* attributes.
 */

import type { Rule } from 'eslint';

const DESIGNSYSTEMET_COMPONENTS = new Set([
    'Button',
    'Heading',
    'Paragraph',
    'Label',
    'Link',
    'Tag',
    'Chip',
    'Badge',
    'Alert',
    'Card',
    'Textfield',
    'Textarea',
    'Select',
    'Checkbox',
    'Radio',
    'Switch',
    'Spinner',
    'Table',
]);

const DEPRECATED_PROPS_MAP: Record<string, string> = {
    size: 'data-size',
    color: 'data-color',
    variant: 'data-variant',
};

const deprecatedProps = Object.keys(DEPRECATED_PROPS_MAP);

const rule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce Designsystemet v1.x API (data-* props)',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            deprecatedProp:
                'Deprecated prop "{{prop}}" on {{component}}. Use "{{replacement}}" instead (Designsystemet v1.x).',
        },
    },

    create(context) {
        return {
            JSXOpeningElement(node: any) {
                const elementName =
                    node.name.type === 'JSXIdentifier' ? node.name.name : null;

                if (!elementName || !DESIGNSYSTEMET_COMPONENTS.has(elementName)) {
                    return;
                }

                for (const attr of node.attributes) {
                    if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') {
                        continue;
                    }

                    const propName = attr.name.name;

                    if (deprecatedProps.includes(propName)) {
                        const replacement = DEPRECATED_PROPS_MAP[propName];

                        context.report({
                            node: attr as unknown as Rule.Node,
                            messageId: 'deprecatedProp',
                            data: {
                                prop: propName,
                                component: elementName,
                                replacement,
                            },
                            fix(fixer) {
                                return fixer.replaceText(attr.name as unknown as Rule.Node, replacement);
                            },
                        });
                    }
                }
            },
        };
    },
};

export default rule;
