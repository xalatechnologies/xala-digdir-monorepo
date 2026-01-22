/**
 * ESLint Rule: no-raw-html-elements
 * 
 * Prevents using raw HTML elements (div, span, p, h1-h6) in React components.
 * Enforces use of design system primitives instead.
 * 
 * @example
 * // ❌ Bad
 * <div>Content</div>
 * <span>Text</span>
 * <h1>Title</h1>
 * 
 * // ✅ Good
 * <Box>Content</Box>
 * <Text>Text</Text>
 * <Heading level={1}>Title</Heading>
 */

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/xala-technologies/platform/blob/main/docs/governance/rules/${name}.md`
);

const RAW_HTML_ELEMENTS = [
  'div',
  'span',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'aside',
  'main',
];

const ELEMENT_ALTERNATIVES: Record<string, string> = {
  div: 'Box, Stack, or Grid from primitives',
  span: 'Text or Inline from primitives',
  p: 'Paragraph from @digdir/designsystemet-react',
  h1: 'Heading level={1} from @digdir/designsystemet-react',
  h2: 'Heading level={2} from @digdir/designsystemet-react',
  h3: 'Heading level={3} from @digdir/designsystemet-react',
  h4: 'Heading level={4} from @digdir/designsystemet-react',
  h5: 'Heading level={5} from @digdir/designsystemet-react',
  h6: 'Heading level={6} from @digdir/designsystemet-react',
  section: 'Section or Box from primitives',
  article: 'Card or Box from primitives',
  header: 'Header component from shells',
  footer: 'Footer component from shells',
  nav: 'Navigation component from composed',
  aside: 'Sidebar or Drawer from composed',
  main: 'PageShell or ContentLayout from composed',
};

export const noRawHtmlElements = createRule({
  name: 'no-raw-html-elements',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw HTML elements in favor of design system primitives',
    },
    messages: {
      noRawElement: 'Do not use raw <{{element}}> elements. Use {{alternative}} instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowInTests: {
            type: 'boolean',
            default: false,
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
      allowInTests: false,
      allowInStories: true,
    },
  ],
  create(context, [options]) {
    const filename = context.getFilename();
    const isTestFile = /\.(test|spec)\.(tsx?|jsx?)$/.test(filename);
    const isStoryFile = /\.stories\.(tsx?|jsx?)$/.test(filename);

    // Skip if in test files and tests are allowed
    if (isTestFile && options.allowInTests) {
      return {};
    }

    // Skip if in story files and stories are allowed
    if (isStoryFile && options.allowInStories) {
      return {};
    }

    return {
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier') {
          const elementName = node.name.name;
          
          if (FORBIDDEN_ELEMENTS.includes(elementName)) {
            const alternative = ELEMENT_ALTERNATIVES[elementName] || 'a design system component';
            
            context.report({
              node,
              messageId: 'noRawElement',
              data: {
                element: elementName,
                alternative,
              },
            });
          }
        }
      },
    };
  },
});
