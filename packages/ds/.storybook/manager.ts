import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

// Suppress WebSocket warnings in Storybook manager
const originalError = console.error;
const originalWarn = console.warn;

const shouldSuppressMessage = (message: unknown): boolean => {
  if (typeof message !== 'string') return false;
  const suppressPatterns = [
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

// Light theme for Storybook UI
export const xalaLightTheme = create({
  base: 'light',
  brandTitle: 'Xala Design System',
  brandUrl: 'https://digilist.no',
  brandTarget: '_self',

  colorPrimary: '#0062BA',
  colorSecondary: '#0062BA',

  appBg: '#FAFAFA',
  appContentBg: '#FFFFFF',
  appPreviewBg: '#FFFFFF',
  appBorderColor: '#E5E5E5',
  appBorderRadius: 8,

  textColor: '#1E1E1E',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#6B6B6B',

  barTextColor: '#6B6B6B',
  barSelectedColor: '#0062BA',
  barHoverColor: '#0062BA',
  barBg: '#FFFFFF',

  inputBg: '#FFFFFF',
  inputBorder: '#E5E5E5',
  inputTextColor: '#1E1E1E',
  inputBorderRadius: 4,
});

// Dark theme for Storybook UI
export const xalaDarkTheme = create({
  base: 'dark',
  brandTitle: 'Xala Design System',
  brandUrl: 'https://digilist.no',
  brandTarget: '_self',

  colorPrimary: '#4DA6FF',
  colorSecondary: '#4DA6FF',

  appBg: '#1a1a1a',
  appContentBg: '#242424',
  appPreviewBg: '#1a1a1a',
  appBorderColor: '#3a3a3a',
  appBorderRadius: 8,

  textColor: '#FFFFFF',
  textInverseColor: '#1E1E1E',
  textMutedColor: '#999999',

  barTextColor: '#999999',
  barSelectedColor: '#4DA6FF',
  barHoverColor: '#4DA6FF',
  barBg: '#242424',

  inputBg: '#1a1a1a',
  inputBorder: '#3a3a3a',
  inputTextColor: '#FFFFFF',
  inputBorderRadius: 4,
});

addons.setConfig({
  theme: xalaLightTheme,
  sidebar: {
    showRoots: true,
    collapsedRoots: ['contributing'],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
