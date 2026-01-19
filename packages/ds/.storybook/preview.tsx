import type { Preview, Decorator } from '@storybook/react';
import React from 'react';

import '@digdir/designsystemet-css';
import '@digdir/designsystemet-theme';

import { ThemeProvider, useTheme } from '../src/ThemeProvider';

/**
 * Theme decorator that wraps all stories with DS theme provider
 * Enables theme switching via Storybook toolbar
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';

  return (
    <ThemeProvider>
      <div data-color-scheme={theme} style={{ padding: 'var(--ds-spacing-4)' }}>
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
    backgrounds: {
      disable: true,
    },
    options: {
      storySort: {
        order: [
          'Overview',
          ['Introduction', 'Getting Started', 'Principles'],
          'Fundamentals',
          ['Tokens', 'Typography', 'Colors', 'Spacing', 'Accessibility'],
          'Components',
          'Blocks',
          'Patterns',
          'Contributing',
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'auto', title: 'Auto (System)', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  tags: ['autodocs'],
};

export default preview;
