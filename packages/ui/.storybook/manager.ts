import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

/**
 * Digilist Light Theme for Storybook Manager
 */
const digilistLightTheme = create({
  base: 'light',
  brandTitle: 'Digilist UI',
  brandUrl: 'https://digilist.no',
  brandTarget: '_blank',

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
 * Digilist Dark Theme for Storybook Manager
 */
const digilistDarkTheme = create({
  base: 'dark',
  brandTitle: 'Digilist UI',
  brandUrl: 'https://digilist.no',
  brandTarget: '_blank',

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

// Configure Storybook manager
addons.setConfig({
  theme: digilistDarkTheme,

  // Sidebar configuration for composition
  sidebar: {
    showRoots: true,
    collapsedRoots: ['platform'], // Collapse external refs by default
  },

  // Enable keyboard shortcuts
  enableShortcuts: true,

  // Show toolbar addons
  showToolbar: true,
});

export { digilistLightTheme, digilistDarkTheme };
