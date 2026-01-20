import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineMain } from '@storybook/react-vite/node';

const getAbsolutePath = (packageName: string) =>
  dirname(fileURLToPath(import.meta.resolve(join(packageName, 'package.json'))));

export default defineMain({
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      strictMode: false,
    },
  },
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  staticDirs: ['./public'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    // '@storybook/addon-vitest' - temporarily disabled, has startup issues
    '@vueless/storybook-dark-mode',
  ],
  docs: {},
  features: {
    // Enable all essential features (controls, viewport, etc.)
    viewportStoryGlobals: true,
  },
  previewHead: (head) => `
    ${head}
    <link rel="stylesheet" href="/vendor/designsystemet.css" />
  `,
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },
  viteFinal: async (config) => {
    const srcPath = new URL('../src', import.meta.url).pathname;
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          // Handle @xala/ds paths - order matters, more specific first
          '@xala/ds/blocks': `${srcPath}/blocks`,
          '@xala/ds/composed': `${srcPath}/composed`,
          '@xala/ds/primitives': `${srcPath}/primitives`,
          '@xala/ds/shells': `${srcPath}/shells`,
          '@xala/ds': srcPath,
          // Storybook 10 exports blocks from addon-docs, not standalone @storybook/blocks
          '@storybook/blocks': '@storybook/addon-docs/blocks',
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      },
    };
  },
});
