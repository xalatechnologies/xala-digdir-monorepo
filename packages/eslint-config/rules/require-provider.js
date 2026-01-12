/**
 * ESLint rule: require-provider
 * Warns when DS components are used without DesignsystemetProvider in entry files.
 * Helps catch missing provider setup.
 */

const DS_COMPONENTS = [
  'Button',
  'Textfield',
  'Select',
  'Checkbox',
  'Radio',
  'Switch',
  'Tabs',
  'Modal',
  'Accordion',
  'Alert',
  'Badge',
  'Card',
  'Chip',
  'Link',
  'Paragraph',
  'Heading',
  'Table',
  'List',
  'Tooltip',
  'Popover',
  'Dropdown',
  'Spinner',
  'SkipLink',
  'Breadcrumbs',
  'Pagination',
  'Tag',
  'Search',
  'NativeSelect',
  'Textarea',
  'Fieldset',
  'Label',
  'ErrorMessage',
  'HelpText',
];

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn when DS components are used in entry files without DesignsystemetProvider import',
      category: 'Digdir Setup',
      recommended: true,
    },
    messages: {
      missingProvider:
        "Using DS component '{{component}}' but DesignsystemetProvider is not imported. Ensure your app is wrapped with <DesignsystemetProvider> in the entry file.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Only check entry-like files
    const isEntryFile =
      filename.includes('main.') ||
      filename.includes('App.') ||
      filename.includes('index.') ||
      filename.includes('_app.') ||
      filename.includes('layout.');

    if (!isEntryFile) return {};

    let hasProviderImport = false;
    const usedDsComponents = [];

    return {
      ImportDeclaration(node) {
        // Check for DesignsystemetProvider import
        if (node.source.value === '@xala/ds' || node.source.value === '@xala/ds/provider') {
          const hasProvider = node.specifiers.some(
            (spec) =>
              spec.type === 'ImportSpecifier' && spec.imported.name === 'DesignsystemetProvider'
          );
          if (hasProvider) {
            hasProviderImport = true;
          }
        }
      },

      JSXOpeningElement(node) {
        const name = node.name.type === 'JSXIdentifier' ? node.name.name : null;
        if (!name) return;

        if (DS_COMPONENTS.includes(name)) {
          usedDsComponents.push({ name, node });
        }
      },

      'Program:exit'() {
        if (hasProviderImport) return;
        if (usedDsComponents.length === 0) return;

        // Only report once for the first DS component found
        const first = usedDsComponents[0];
        context.report({
          node: first.node,
          messageId: 'missingProvider',
          data: { component: first.name },
        });
      },
    };
  },
};
