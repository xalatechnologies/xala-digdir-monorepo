import { describe, it, expect } from 'vitest';
import { nb } from '../locales/nb';
import { en } from '../locales/en';

/**
 * Translation completeness tests
 * Verifies that all locale files have the same keys (parity)
 */
describe.skip('Translation Completeness', () => {
  const nbKeys = Object.keys(nb).sort();
  const enKeys = Object.keys(en).sort();

  it('should have the same number of keys in nb and en', () => {
    expect(nbKeys.length).toBe(enKeys.length);
  });

  it('should have all nb keys present in en', () => {
    const missingInEn = nbKeys.filter((key) => !(key in en));
    expect(missingInEn).toEqual([]);
  });

  it('should have all en keys present in nb', () => {
    const missingInNb = enKeys.filter((key) => !(key in nb));
    expect(missingInNb).toEqual([]);
  });

  it('should not have empty translation values in nb', () => {
    const emptyKeys = nbKeys.filter((key) => nb[key].trim() === '');
    expect(emptyKeys).toEqual([]);
  });

  it('should not have empty translation values in en', () => {
    const emptyKeys = enKeys.filter((key) => en[key].trim() === '');
    expect(emptyKeys).toEqual([]);
  });

  it('should have consistent interpolation placeholders between locales', () => {
    const placeholderRegex = /\{\{(\w+)\}\}/g;

    const inconsistentKeys: string[] = [];

    nbKeys.forEach((key) => {
      if (!(key in en)) return;

      const nbMatches = nb[key].match(placeholderRegex) || [];
      const enMatches = en[key].match(placeholderRegex) || [];

      const nbPlaceholders = nbMatches.sort();
      const enPlaceholders = enMatches.sort();

      if (JSON.stringify(nbPlaceholders) !== JSON.stringify(enPlaceholders)) {
        inconsistentKeys.push(key);
      }
    });

    expect(inconsistentKeys).toEqual([]);
  });

  describe.skip('Domain coverage', () => {
    const expectedDomains = [
      'common',
      'nav',
      'auth',
      'dashboard',
      'listings',
      'booking',
      'bookings',
      'calendar',
      'messages',
      'reports',
      'organizations',
      'users',
      'settings',
      'seasons',
      'requests',
      'minside',
      'org',
      'errors',
      'policy',
      'actions',
    ];

    expectedDomains.forEach((domain) => {
      it(`should have keys for domain: ${domain}`, () => {
        const domainKeys = nbKeys.filter((key) => key.startsWith(`${domain}.`));
        expect(domainKeys.length).toBeGreaterThan(0);
      });
    });
  });
});
