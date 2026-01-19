import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

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
