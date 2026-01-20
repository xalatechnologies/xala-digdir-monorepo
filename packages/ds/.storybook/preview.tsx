import type { Preview, Decorator } from '@storybook/react-vite';
import React from 'react';

// Inter font from Google Fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// CSS loaded via previewHead in main.ts to avoid Storybook 10 module resolution warning
import './public/themes/digilist.css';
import './public/themes/digilist-extensions.css';

import { ThemeProvider, useTheme } from '../src/ThemeProvider';
import { I18nProvider } from '@xala/i18n';

// Suppress React 18 act() warnings and WebSocket HMR noise in Storybook
// These are expected in Storybook's non-testing environment and don't indicate real issues
//
// 🔍 Need to see these warnings for debugging?
// Temporarily comment out the console overrides below (lines 36-49)
// Or access: window.__originalConsole.error('test') in browser console
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

const shouldSuppressMessage = (message: unknown): boolean => {
  if (typeof message !== 'string') return false;
  
  const suppressPatterns = [
    'Warning: The current testing environment is not configured to support act',
    'WebSocket is already in CLOSING or CLOSED state',
    'WebSocket connection',
    'WebSocket error',
  ];
  
  return suppressPatterns.some(pattern => message.includes(pattern));
};

console.error = (...args) => {
  if (shouldSuppressMessage(args[0])) return;
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  if (shouldSuppressMessage(args[0])) return;
  originalWarn.call(console, ...args);
};

console.log = (...args) => {
  if (shouldSuppressMessage(args[0])) return;
  originalLog.call(console, ...args);
};

// Store originals for debugging (accessible via window.__originalConsole)
if (typeof window !== 'undefined') {
  (window as any).__originalConsole = {
    error: originalError,
    warn: originalWarn,
    log: originalLog,
  };
}

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
      context: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
    backgrounds: {
      disabled: true,
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
