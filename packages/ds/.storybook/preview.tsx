import type { Preview, Decorator } from '@storybook/react';
import React from 'react';

// Inter font from Google Fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@digdir/designsystemet-css';
import './public/themes/digilist.css';
import './public/themes/digilist-extensions.css';

import { ThemeProvider, useTheme } from '../src/ThemeProvider';
import { I18nProvider } from '@xala/i18n';

/**
 * Theme decorator that wraps all stories with DS theme provider
 * Enables theme switching via Storybook toolbar
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';

  return (
    <I18nProvider initialLocale="nb">
      <ThemeProvider>
        <div 
          data-color-scheme={theme} 
          data-size="md"
          style={{ 
            padding: 'var(--ds-spacing-4)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    </I18nProvider>
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
