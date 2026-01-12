/**
 * ESLint rule: as-child-single-child
 * Enforces that components using asChild prop have exactly ONE child element.
 * This is a Digdir/Radix pattern requirement.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Components with asChild prop must have exactly one child element',
      category: 'Digdir Component Patterns',
      recommended: true,
    },
    messages: {
      multipleChildren:
        "Component '{{component}}' with asChild must have exactly ONE child element, found {{count}}. The asChild pattern merges props onto a single child.",
      noChildren:
        "Component '{{component}}' with asChild must have exactly ONE child element. The asChild pattern requires a child to merge props onto.",
      textNotAllowed:
        "Component '{{component}}' with asChild cannot have text content as a direct child. Wrap text in an element.",
    },
    schema: [],
  },

  create(context) {
    return {
      JSXElement(node) {
        const openingElement = node.openingElement;

        // Check if asChild prop is present
        const asChildAttr = openingElement.attributes.find(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.name === 'asChild' &&
            // asChild={true} or just asChild (implicit true)
            (attr.value === null ||
              (attr.value.type === 'JSXExpressionContainer' &&
                attr.value.expression.type === 'Literal' &&
                attr.value.expression.value === true))
        );

        if (!asChildAttr) return;

        const componentName =
          openingElement.name.type === 'JSXIdentifier'
            ? openingElement.name.name
            : openingElement.name.type === 'JSXMemberExpression'
              ? `${openingElement.name.object.name}.${openingElement.name.property.name}`
              : 'Component';

        // Count actual element children (ignore whitespace-only text)
        const children = node.children.filter((child) => {
          if (child.type === 'JSXElement' || child.type === 'JSXFragment') return true;
          if (child.type === 'JSXExpressionContainer') return true;
          if (child.type === 'JSXText') {
            // Ignore whitespace-only text nodes
            return child.value.trim().length > 0;
          }
          return false;
        });

        if (children.length === 0) {
          context.report({
            node: openingElement,
            messageId: 'noChildren',
            data: { component: componentName },
          });
          return;
        }

        if (children.length > 1) {
          context.report({
            node: openingElement,
            messageId: 'multipleChildren',
            data: { component: componentName, count: children.length },
          });
          return;
        }

        // Check if the single child is a text node (not allowed)
        const singleChild = children[0];
        if (singleChild.type === 'JSXText') {
          context.report({
            node: singleChild,
            messageId: 'textNotAllowed',
            data: { component: componentName },
          });
        }
      },
    };
  },
};
