import type { Preview, Decorator } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { useDarkMode, DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
import React, { useEffect, useState } from 'react';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { create } from '@storybook/theming';
import { addons } from '@storybook/preview-api';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';

// Inter font
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Designsystemet CSS (loaded via Vite)
import '@digdir/designsystemet-css';

// Suppress React warnings in Storybook
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
 * Digilist Light Theme
 */
const digilistLightTheme = create({
  base: 'light',
  brandTitle: 'Digilist UI',
  brandUrl: 'https://digilist.no',

  colorPrimary: '#0062BA',
  colorSecondary: '#0062BA',

  appBg: '#f0f4f8',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#a9bed6',
  appBorderRadius: 4,

  textColor: '#1e2b3c',
  textInverseColor: '#ffffff',
  textMutedColor: '#5b6c7f',

  barBg: '#ffffff',
  barTextColor: '#1e2b3c',
  barHoverColor: '#0062BA',
  barSelectedColor: '#0062BA',

  inputBg: '#ffffff',
  inputBorder: '#a9bed6',
  inputTextColor: '#1e2b3c',
  inputBorderRadius: 4,

  fontBase: 'Inter, system-ui, sans-serif',
  fontCode: 'monospace',
});

/**
 * Digilist Dark Theme
 */
const digilistDarkTheme = create({
  base: 'dark',
  brandTitle: 'Digilist UI',
  brandUrl: 'https://digilist.no',

  colorPrimary: '#76b5fb',
  colorSecondary: '#76b5fb',

  appBg: '#101822',
  appContentBg: '#1b2939',
  appPreviewBg: '#1b2939',
  appBorderColor: '#375272',
  appBorderRadius: 4,

  textColor: '#e8edf4',
  textInverseColor: '#1e2b3c',
  textMutedColor: '#97aac0',

  barBg: '#16202d',
  barTextColor: '#e8edf4',
  barHoverColor: '#76b5fb',
  barSelectedColor: '#76b5fb',

  inputBg: '#1f2f41',
  inputBorder: '#375272',
  inputTextColor: '#e8edf4',
  inputBorderRadius: 4,

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
 * Themed DocsContainer
 */
function ThemedDocsContainer(props: DocsContainerProps) {
  const isDark = useIsDarkMode();

  return (
    <DocsContainer {...props} theme={isDark ? digilistDarkTheme : digilistLightTheme}>
      {props.children}
    </DocsContainer>
  );
}

// Custom viewports
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
};

/**
 * Theme decorator with Designsystemet provider simulation
 */
const withTheme: Decorator = (Story) => {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }, [theme]);

  return (
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
          'Compat',
          ['Layout', 'Navigation', 'Forms', 'Status', 'Dashboard'],
          'Domain',
          ['Rental Objects', 'Booking', 'Seasons'],
          'Features',
        ],
      },
    },
  },
  decorators: [withTheme],
  tags: ['autodocs'],
};

export default preview;
