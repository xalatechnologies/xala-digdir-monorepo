/**
 * ESLint rule: require-button-type
 * Requires explicit type attribute on button elements.
 * Prevents accidental form submissions (default type is "submit").
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require explicit type attribute on button elements',
      category: 'Digdir Accessibility',
      recommended: true,
    },
    messages: {
      missingType:
        'Button elements must have an explicit type attribute ("button", "submit", or "reset"). Default is "submit" which may cause unintended form submissions.',
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check both <button> and <Button> components
        const name = node.name.type === 'JSXIdentifier' ? node.name.name : null;
        if (!name) return;
        if (name !== 'button' && name !== 'Button') return;

        const hasType = node.attributes.some(
          (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'type'
        );

        if (!hasType) {
          context.report({
            node,
            messageId: 'missingType',
            fix(fixer) {
              const lastAttr = node.attributes[node.attributes.length - 1];
              if (lastAttr) {
                return fixer.insertTextAfter(lastAttr, ' type="button"');
              }
              return fixer.insertTextAfter(node.name, ' type="button"');
            },
          });
        }
      },
    };
  },
};
