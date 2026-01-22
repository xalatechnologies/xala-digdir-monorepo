import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const getAbsolutePath = (packageName: string) =>
  dirname(fileURLToPath(import.meta.resolve(join(packageName, 'package.json'))));

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  staticDirs: ['./public'],

  // Storybook Composition - Reference external Storybooks
  // This allows viewing Platform UI stories alongside Domain UI stories
  refs: {
    // Platform UI Storybook (xala-platform)
    // For local dev: run `pnpm storybook` in xala-platform/packages/platform first
    'platform': {
      title: 'Platform UI',
      url: process.env.STORYBOOK_PLATFORM_URL || 'http://localhost:6006',
      expanded: false, // Collapse by default to focus on domain stories
    },
  },

  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-interactions'),
    '@vueless/storybook-dark-mode',
  ],

  docs: {},

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
    const uiSrcPath = new URL('../src', import.meta.url).pathname;
    const compatPath = `${uiSrcPath}/compat`;

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          // Domain UI package aliases
          '@digilist/ui/compat': compatPath,
          '@digilist/ui/blocks': `${uiSrcPath}/blocks`,
          '@digilist/ui/features': `${uiSrcPath}/features`,
          '@digilist/ui': uiSrcPath,
          // Platform UI aliases - point to compat layer
          '@xalatechnologies/platform/ui/patterns': compatPath,
          '@xalatechnologies/platform/ui/primitives': compatPath,
          '@xalatechnologies/platform/ui/composed': compatPath,
          '@xalatechnologies/platform/ui/blocks': compatPath,
          '@xalatechnologies/platform/ui/shells': compatPath,
          '@xalatechnologies/platform/ui': compatPath,
          // Storybook blocks alias
          '@storybook/blocks': '@storybook/addon-docs/blocks',
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      },
      define: {
        ...config.define,
        'process.env': {},
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: [...(config.optimizeDeps?.exclude || [])],
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          define: {
            global: 'globalThis',
          },
        },
      },
    };
  },
};

export default config;
