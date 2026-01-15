/**
 * Digdir Design System ESLint Rules
 * Custom rules for enforcing design tokens and component standards
 */

import noHardcodedColors from './no-hardcoded-colors.js';
import noHardcodedSpacing from './no-hardcoded-spacing.js';
import noHardcodedTypography from './no-hardcoded-typography.js';
import noHardcodedBorderRadius from './no-hardcoded-border-radius.js';
import asChildSingleChild from './as-child-single-child.js';
import requireButtonType from './require-button-type.js';
import requireInteractiveLabels from './require-interactive-labels.js';
import preferDsComponents from './prefer-ds-components.js';
import requireProvider from './require-provider.js';
import i18nNoHardcodedStrings from './i18n-no-hardcoded-strings.js';

export const rules = {
  'no-hardcoded-colors': noHardcodedColors,
  'no-hardcoded-spacing': noHardcodedSpacing,
  'no-hardcoded-typography': noHardcodedTypography,
  'no-hardcoded-border-radius': noHardcodedBorderRadius,
  'as-child-single-child': asChildSingleChild,
  'require-button-type': requireButtonType,
  'require-interactive-labels': requireInteractiveLabels,
  'prefer-ds-components': preferDsComponents,
  'require-provider': requireProvider,
  'i18n-no-hardcoded-strings': i18nNoHardcodedStrings,
};

export default rules;
