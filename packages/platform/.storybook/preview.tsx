import type { Preview, Decorator } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from 'storybook/viewport';
import { useDarkMode, DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
import React, { useEffect, useState } from 'react';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { themes, create } from 'storybook/theming';
import { addons } from 'storybook/preview-api';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';

// Inter font from Google Fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// CSS loaded via previewHead in main.ts
import './public/themes/digilist.css';
import './public/themes/digilist-extensions.css';

import { ThemeProvider } from '../src/ThemeProvider';
import { I18nProvider } from '../src/i18n';

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

// Get channel for dark mode events
const channel = addons.getChannel();

/**
 * Digilist Light Theme - using design tokens
 */
const digilistLightTheme = create({
  base: 'light',
  brandTitle: 'Xala Design System',
  brandUrl: 'https://designsystemet.no',

  // Colors from Digilist light theme tokens
  colorPrimary: '#0062BA', // --ds-color-accent-base-default
  colorSecondary: '#0062BA',

  // UI backgrounds
  appBg: '#f0f4f8', // --ds-color-accent-background-tinted
  appContentBg: '#ffffff', // --ds-color-accent-background-default
  appPreviewBg: '#ffffff',
  appBorderColor: '#a9bed6', // --ds-color-accent-border-subtle
  appBorderRadius: 4,

  // Text colors
  textColor: '#1e2b3c', // --ds-color-neutral-text-default
  textInverseColor: '#ffffff',
  textMutedColor: '#5b6c7f', // --ds-color-neutral-text-subtle

  // Toolbar
  barBg: '#ffffff',
  barTextColor: '#1e2b3c',
  barHoverColor: '#0062BA',
  barSelectedColor: '#0062BA',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#a9bed6',
  inputTextColor: '#1e2b3c',
  inputBorderRadius: 4,

  // Typography
  fontBase: 'Inter, system-ui, sans-serif',
  fontCode: 'monospace',
});

/**
 * Digilist Dark Theme - using design tokens
 */
const digilistDarkTheme = create({
  base: 'dark',
  brandTitle: 'Xala Design System',
  brandUrl: 'https://designsystemet.no',

  // Colors from Digilist dark theme tokens
  colorPrimary: '#76b5fb', // --ds-color-accent-base-default (dark)
  colorSecondary: '#76b5fb',

  // UI backgrounds
  appBg: '#101822', // --ds-color-accent-background-default (dark)
  appContentBg: '#1b2939', // --ds-color-accent-surface-default (dark)
  appPreviewBg: '#1b2939',
  appBorderColor: '#375272', // --ds-color-accent-border-subtle (dark)
  appBorderRadius: 4,

  // Text colors
  textColor: '#e8edf4', // --ds-color-neutral-text-default (dark)
  textInverseColor: '#1e2b3c',
  textMutedColor: '#97aac0', // --ds-color-neutral-text-subtle (dark)

  // Toolbar
  barBg: '#16202d', // --ds-color-accent-background-tinted (dark)
  barTextColor: '#e8edf4',
  barHoverColor: '#76b5fb',
  barSelectedColor: '#76b5fb',

  // Form colors
  inputBg: '#1f2f41', // --ds-color-accent-surface-tinted (dark)
  inputBorder: '#375272',
  inputTextColor: '#e8edf4',
  inputBorderRadius: 4,

  // Typography
  fontBase: 'Inter, system-ui, sans-serif',
  fontCode: 'monospace',
});

/**
 * Custom hook to listen for dark mode changes
 */
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, setIsDark);
    return () => channel.off(DARK_MODE_EVENT_NAME, setIsDark);
  }, []);

  return isDark;
}

/**
 * Themed DocsContainer that responds to dark mode toggle
 */
function ThemedDocsContainer(props: DocsContainerProps) {
  const isDark = useIsDarkMode();

  return (
    <DocsContainer {...props} theme={isDark ? digilistDarkTheme : digilistLightTheme}>
      {props.children}
    </DocsContainer>
  );
}

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
 * Theme decorator - uses dark mode addon hook and createRuntime() from @xala/runtime
 */
const withTheme: Decorator = (Story) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    // Apply theme to document for CSS variables
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  // Note: For Storybook, we use a simplified provider setup.
  // In production apps, use RuntimeProvider from @xala/runtime.
  // For component isolation testing, use createRuntime().TestWrapper.
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
      container: ThemedDocsContainer,
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
    darkMode: {
      dark: digilistDarkTheme,
      light: digilistLightTheme,
      stylePreview: true,
      classTarget: 'html',
      darkClass: 'dark',
      lightClass: 'light',
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
