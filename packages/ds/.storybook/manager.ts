import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

/**
 * Digilist Light Theme for Storybook Manager
 * Uses colors from Digilist design tokens
 */
const digilistLightTheme = create({
  base: 'light',
  brandTitle: 'Xala Design System',
  brandUrl: 'https://designsystemet.no',
  brandTarget: '_blank',

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
 * Digilist Dark Theme for Storybook Manager
 * Uses colors from Digilist design tokens
 */
const digilistDarkTheme = create({
  base: 'dark',
  brandTitle: 'Xala Design System',
  brandUrl: 'https://designsystemet.no',
  brandTarget: '_blank',

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

// Set the default theme (will be switched by dark mode addon)
addons.setConfig({
  theme: digilistDarkTheme, // Default to dark theme (user preference)
});

// Export themes for use by dark mode addon
export { digilistLightTheme, digilistDarkTheme };
