/**
 * ESLint rule: require-interactive-labels
 * Requires accessible labels on interactive elements.
 * Enforces aria-label, aria-labelledby, or visible text content.
 */

const INTERACTIVE_ELEMENTS = ['button', 'Button', 'a', 'Link', 'input', 'select', 'textarea'];

const ICON_BUTTON_INDICATORS = ['Icon', 'icon', 'svg', 'Svg'];

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require accessible labels on interactive elements',
      category: 'Digdir Accessibility',
      recommended: true,
    },
    messages: {
      missingLabel:
        "Interactive element '{{element}}' appears to be an icon-only button but lacks an accessible label. Add aria-label or title attribute.",
      emptyButton: "Button element has no accessible text content. Add text, aria-label, or title.",
    },
    schema: [],
  },

  create(context) {
    return {
      JSXElement(node) {
        const openingElement = node.openingElement;
        const name =
          openingElement.name.type === 'JSXIdentifier' ? openingElement.name.name : null;

        if (!name) return;
        if (!INTERACTIVE_ELEMENTS.includes(name)) return;

        // Only check buttons and links that might be icon-only
        if (name !== 'button' && name !== 'Button' && name !== 'a' && name !== 'Link') return;

        const attrs = openingElement.attributes;

        // Check if it has aria-label, aria-labelledby, or title
        const hasLabel = attrs.some(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            (attr.name.name === 'aria-label' ||
              attr.name.name === 'aria-labelledby' ||
              attr.name.name === 'title')
        );

        if (hasLabel) return;

        // Check children for text content
        const hasTextContent = node.children.some((child) => {
          if (child.type === 'JSXText' && child.value.trim().length > 0) return true;
          if (child.type === 'JSXExpressionContainer') {
            // String literal in expression
            if (child.expression.type === 'Literal' && typeof child.expression.value === 'string')
              return true;
          }
          // Check for text inside nested elements (simplified check)
          if (child.type === 'JSXElement') {
            const childName =
              child.openingElement.name.type === 'JSXIdentifier'
                ? child.openingElement.name.name
                : '';
            // If child is NOT an icon, assume it might have text
            if (!ICON_BUTTON_INDICATORS.some((icon) => childName.includes(icon))) {
              return true;
            }
          }
          return false;
        });

        if (hasTextContent) return;

        // Check if children appear to be icons
        const hasIconChild = node.children.some((child) => {
          if (child.type === 'JSXElement') {
            const childName =
              child.openingElement.name.type === 'JSXIdentifier'
                ? child.openingElement.name.name
                : '';
            return ICON_BUTTON_INDICATORS.some((icon) => childName.includes(icon));
          }
          return false;
        });

        // Self-closing button or link with no children
        const isSelfClosing = openingElement.selfClosing;

        if (hasIconChild) {
          context.report({
            node: openingElement,
            messageId: 'missingLabel',
            data: { element: name },
          });
        } else if (isSelfClosing || node.children.length === 0) {
          context.report({
            node: openingElement,
            messageId: 'emptyButton',
          });
        }
      },
    };
  },
};
