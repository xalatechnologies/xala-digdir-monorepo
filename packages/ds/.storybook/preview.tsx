import type { Preview, Decorator } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { useDarkMode } from '@vueless/storybook-dark-mode';
import React, { useEffect } from 'react';

// Inter font from Google Fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// CSS loaded via previewHead in main.ts
import './public/themes/digilist.css';
import './public/themes/digilist-extensions.css';

import { ThemeProvider } from '../src/ThemeProvider';
import { I18nProvider } from '@xala/i18n';

// Suppress React 18 act() warnings and WebSocket HMR noise
const originalError = console.error;
const originalWarn = console.warn;

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

// Custom Norwegian viewports
const customViewports = {
  mobileNorway: {
    name: 'Mobile (Norway)',
    styles: { width: '375px', height: '667px' },
    type: 'mobile' as const,
  },
  tabletNorway: {
    name: 'Tablet (Norway)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet' as const,
  },
  desktopNorway: {
    name: 'Desktop (Norway)',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop' as const,
  },
  accessibleLarge: {
    name: 'Accessible (Large)',
    styles: { width: '1920px', height: '1080px' },
    type: 'desktop' as const,
  },
};

/**
 * Theme decorator - uses dark mode addon hook
 */
const withTheme: Decorator = (Story) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    // Apply theme to document for CSS variables
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  return (
    <I18nProvider initialLocale="nb">
      <ThemeProvider>
        <div
          data-color-scheme={theme}
          data-size="md"
          style={{
            padding: 'var(--ds-spacing-4)',
            fontFamily: 'Inter, system-ui, sans-serif',
            minHeight: '100px',
            backgroundColor: isDarkMode ? 'var(--ds-color-neutral-background-default)' : undefined,
            color: isDarkMode ? 'var(--ds-color-neutral-text-default)' : undefined,
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
      expanded: true,
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
      disable: true,
    },
    viewport: {
      options: {
        ...MINIMAL_VIEWPORTS,
        ...INITIAL_VIEWPORTS,
        ...customViewports,
      },
    },
    options: {
      storySort: {
        order: [
          'Overview',
          ['Introduction', 'Getting Started', 'Principles'],
          'Fundamentals',
          ['Tokens', 'Typography', 'Colors', 'Spacing', 'Accessibility', 'Best Practices', 'Patterns', 'Theme Builder'],
          'Components',
          'Composed',
          'Blocks',
          'Primitives',
          'Patterns',
          'Contributing',
        ],
      },
    },
  },
  decorators: [withTheme],
  tags: ['autodocs'],
};

export default preview;
