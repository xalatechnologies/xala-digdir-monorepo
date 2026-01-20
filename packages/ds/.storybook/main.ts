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
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-themes'),
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
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@xala/ds': new URL('../src', import.meta.url).pathname,
        },
      },
    };
  },
});
