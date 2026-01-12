/**
 * ESLint rule: prefer-ds-components
 * Suggests using @xala/ds components instead of native HTML elements
 * when design system components are available.
 */

const DS_COMPONENT_SUGGESTIONS = {
  // Native HTML -> DS Component
  button: {
    component: 'Button',
    message: "Consider using <Button> from '@xala/ds' instead of native <button>.",
  },
  input: {
    component: 'Textfield',
    message:
      "Consider using <Textfield> from '@xala/ds' for text inputs, or other form components for specific input types.",
  },
  select: {
    component: 'Select / NativeSelect',
    message: "Consider using <Select> or <NativeSelect> from '@xala/ds' instead of native <select>.",
  },
  textarea: {
    component: 'Textarea',
    message: "Consider using <Textarea> from '@xala/ds' instead of native <textarea>.",
  },
  a: {
    component: 'Link',
    message: "Consider using <Link> from '@xala/ds' instead of native <a>.",
  },
  table: {
    component: 'Table',
    message:
      "Consider using <Table> from '@xala/ds' instead of native <table> for consistent styling.",
  },
  dialog: {
    component: 'Modal',
    message: "Consider using <Modal> from '@xala/ds' instead of native <dialog>.",
  },
  details: {
    component: 'Accordion',
    message: "Consider using <Accordion> from '@xala/ds' for expandable content sections.",
  },
  fieldset: {
    component: 'Fieldset',
    message: "Consider using <Fieldset> from '@xala/ds' instead of native <fieldset>.",
  },
  label: {
    component: 'Label',
    message: "Consider using <Label> from '@xala/ds' instead of native <label>.",
  },
  ul: {
    component: 'List',
    message: "For styled lists, consider using <List> from '@xala/ds'.",
  },
  ol: {
    component: 'List',
    message: "For styled lists, consider using <List> with ordered prop from '@xala/ds'.",
  },
};

// Elements that are commonly used and shouldn't warn (too noisy)
const IGNORED_ELEMENTS = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'nav', 'header', 'footer', 'main', 'section', 'article', 'aside', 'form', 'img', 'br', 'hr'];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Suggest using @xala/ds components instead of native HTML elements',
      category: 'Digdir Component Usage',
      recommended: false, // Suggestion, not required
    },
    messages: {
      preferDsComponent: '{{message}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: { type: 'string' },
            description: 'Elements to ignore',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const ignore = options.ignore || [];

    return {
      JSXOpeningElement(node) {
        const name = node.name.type === 'JSXIdentifier' ? node.name.name : null;
        if (!name) return;

        // Skip if in ignore list or common elements
        if (ignore.includes(name) || IGNORED_ELEMENTS.includes(name)) return;

        const suggestion = DS_COMPONENT_SUGGESTIONS[name];
        if (!suggestion) return;

        context.report({
          node,
          messageId: 'preferDsComponent',
          data: { message: suggestion.message },
        });
      },
    };
  },
};
