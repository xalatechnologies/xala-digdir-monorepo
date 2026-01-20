import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

// Suppress WebSocket warnings in Storybook manager
// These are from HMR and don't indicate real issues
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

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

console.log = (...args) => {
  if (shouldSuppressMessage(args[0])) return;
  originalLog.call(console, ...args);
};

const xalaTheme = create({
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

addons.setConfig({
  theme: xalaTheme,
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
