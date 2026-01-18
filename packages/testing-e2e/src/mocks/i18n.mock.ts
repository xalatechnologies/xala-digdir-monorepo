/**
 * i18n mock for tests
 * Returns the translation key as the text for easy assertion
 */

import { vi } from 'vitest';

export const mockT = (key: string, _params?: Record<string, unknown>) => key;
export const mockUseT = () => mockT;
export const mockUseLocale = () => 'nb';

export const i18nMock = {
  useT: mockUseT,
  useLocale: mockUseLocale,
  t: mockT,
  T: ({ id }: { id: string }) => id,
  translations: {},
  interpolate: (text: string) => text,
};

/**
 * Setup i18n mock for vitest
 * Call this in your test setup file
 */
export function setupI18nMock() {
  vi.mock('@xala/i18n', () => i18nMock);
}
