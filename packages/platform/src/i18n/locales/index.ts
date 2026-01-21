/**
 * Translations Index
 *
 * Updated to use modular JSON files instead of monolithic TS.
 * Each language folder contains namespace-based JSON files combined via index.ts
 */
import { nb } from './nb';
import { en } from './en';
import type { TranslationsRegistry } from '../types';

export const translations: TranslationsRegistry = {
  nb,
  en,
};

export { nb, en };
