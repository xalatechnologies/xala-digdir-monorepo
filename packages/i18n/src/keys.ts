/**
 * Generated Translation Key Registry
 *
 * This file provides type-safe access to translation keys.
 * Run `pnpm -F @xala/i18n generate:keys` to regenerate.
 *
 * @example
 * import { TranslationKeyPath, isValidKey } from './keys';
 *
 * const key: TranslationKeyPath = 'common.save'; // Type-checked!
 * if (isValidKey('my.key')) { ... }
 */

import { nb } from './locales/nb';

/**
 * All valid translation key paths.
 * Auto-generated from Norwegian (canonical) translation file.
 */
export type TranslationKeyPath = keyof typeof nb;

/**
 * Array of all valid translation keys for runtime validation.
 */
export const ALL_TRANSLATION_KEYS: readonly TranslationKeyPath[] = Object.keys(nb) as TranslationKeyPath[];

/**
 * Set of all valid translation keys for O(1) lookup.
 */
export const TRANSLATION_KEY_SET: ReadonlySet<string> = new Set(ALL_TRANSLATION_KEYS);

/**
 * Check if a string is a valid translation key.
 * @param key - The key to validate
 * @returns true if the key exists in the translation registry
 */
export function isValidKey(key: string): key is TranslationKeyPath {
  return TRANSLATION_KEY_SET.has(key);
}

/**
 * Get all keys matching a namespace prefix.
 * @param namespace - The namespace prefix (e.g., 'common', 'auth')
 * @returns Array of keys matching the namespace
 *
 * @example
 * getKeysForNamespace('common') // ['common.save', 'common.cancel', ...]
 */
export function getKeysForNamespace(namespace: string): TranslationKeyPath[] {
  const prefix = `${namespace}.`;
  return ALL_TRANSLATION_KEYS.filter((key) => key.startsWith(prefix));
}

/**
 * Get all unique namespaces from translation keys.
 * @returns Array of unique namespace prefixes
 *
 * @example
 * getAllNamespaces() // ['common', 'auth', 'dashboard', ...]
 */
export function getAllNamespaces(): string[] {
  const namespaces = new Set<string>();
  for (const key of ALL_TRANSLATION_KEYS) {
    const dotIndex = key.indexOf('.');
    if (dotIndex > 0) {
      namespaces.add(key.substring(0, dotIndex));
    }
  }
  return Array.from(namespaces).sort();
}

/**
 * Translation key statistics for debugging and CI.
 */
export interface TranslationStats {
  totalKeys: number;
  namespaces: string[];
  keysByNamespace: Record<string, number>;
}

/**
 * Get statistics about translation keys.
 */
export function getTranslationStats(): TranslationStats {
  const namespaces = getAllNamespaces();
  const keysByNamespace: Record<string, number> = {};

  for (const ns of namespaces) {
    keysByNamespace[ns] = getKeysForNamespace(ns).length;
  }

  return {
    totalKeys: ALL_TRANSLATION_KEYS.length,
    namespaces,
    keysByNamespace,
  };
}
