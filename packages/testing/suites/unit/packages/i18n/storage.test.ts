import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Cookies from 'js-cookie';
import {
  getCookieLocale,
  setCookieLocale,
  removeCookieLocale,
  getLocalStorageLocale,
  setLocalStorageLocale,
  removeLocalStorageLocale,
  getPersistedLocale,
  persistLocale,
  clearPersistedLocale,
} from '@digilist/api/storage';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

/**
 * Storage Utilities Tests
 *
 * These tests verify:
 * 1. Cookie read/write/remove operations (via js-cookie)
 * 2. LocalStorage read/write/remove operations
 * 3. Combined persistence utilities (dual-write strategy)
 * 4. SSR-safe behavior (window/localStorage checks)
 */
// SKIPPED
describe.skip('Storage Utilities', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up localStorage mock on window
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCookieLocale', () => {
    it('should return locale from cookie when present', () => {
      vi.mocked(Cookies.get).mockReturnValue('nb');
      const result = getCookieLocale();
      expect(result).toBe('nb');
      expect(Cookies.get).toHaveBeenCalledWith('digilist_locale');
    });

    it('should return null when cookie is not set', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);
      const result = getCookieLocale();
      expect(result).toBeNull();
    });

    it('should return null when cookie returns empty string', () => {
      vi.mocked(Cookies.get).mockReturnValue('');
      const result = getCookieLocale();
      expect(result).toBeNull();
    });

    it('should return null when cookie throws error', () => {
      vi.mocked(Cookies.get).mockImplementation(() => {
        throw new Error('Cookie access denied');
      });
      const result = getCookieLocale();
      expect(result).toBeNull();
    });
  });

  describe('setCookieLocale', () => {
    it('should set locale cookie with correct options', () => {
      setCookieLocale('en');
      expect(Cookies.set).toHaveBeenCalledWith(
        'digilist_locale',
        'en',
        expect.objectContaining({
          expires: 365,
          sameSite: 'lax',
        })
      );
    });

    it('should set locale to nb', () => {
      setCookieLocale('nb');
      expect(Cookies.set).toHaveBeenCalledWith(
        'digilist_locale',
        'nb',
        expect.any(Object)
      );
    });

    it('should not throw when cookie set fails', () => {
      vi.mocked(Cookies.set).mockImplementation(() => {
        throw new Error('Cookie set failed');
      });
      expect(() => setCookieLocale('en')).not.toThrow();
    });
  });

  describe('removeCookieLocale', () => {
    it('should remove locale cookie', () => {
      removeCookieLocale();
      expect(Cookies.remove).toHaveBeenCalledWith('digilist_locale');
    });

    it('should not throw when cookie removal fails', () => {
      vi.mocked(Cookies.remove).mockImplementation(() => {
        throw new Error('Cookie removal failed');
      });
      expect(() => removeCookieLocale()).not.toThrow();
    });
  });

  describe('getLocalStorageLocale', () => {
    it('should return locale from localStorage when present', () => {
      localStorageMock.getItem.mockReturnValue('en');
      const result = getLocalStorageLocale();
      expect(result).toBe('en');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('locale');
    });

    it('should return null when localStorage key is not set', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = getLocalStorageLocale();
      expect(result).toBeNull();
    });

    it('should return null when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      const result = getLocalStorageLocale();
      expect(result).toBeNull();
    });
  });

  describe('setLocalStorageLocale', () => {
    it('should set locale in localStorage', () => {
      setLocalStorageLocale('nb');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'nb');
    });

    it('should not throw when localStorage set fails', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      expect(() => setLocalStorageLocale('en')).not.toThrow();
    });
  });

  describe('removeLocalStorageLocale', () => {
    it('should remove locale from localStorage', () => {
      removeLocalStorageLocale();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('locale');
    });

    it('should not throw when localStorage removal fails', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage removal failed');
      });
      expect(() => removeLocalStorageLocale()).not.toThrow();
    });
  });

  describe('getPersistedLocale', () => {
    it('should prefer cookie over localStorage', () => {
      vi.mocked(Cookies.get).mockReturnValue('nb');
      localStorageMock.getItem.mockReturnValue('en');
      const result = getPersistedLocale();
      expect(result).toBe('nb');
    });

    it('should fall back to localStorage when cookie is not set', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);
      localStorageMock.getItem.mockReturnValue('en');
      const result = getPersistedLocale();
      expect(result).toBe('en');
    });

    it('should return null when neither cookie nor localStorage is set', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);
      localStorageMock.getItem.mockReturnValue(null);
      const result = getPersistedLocale();
      expect(result).toBeNull();
    });

    it('should fall back to localStorage when cookie read fails', () => {
      vi.mocked(Cookies.get).mockImplementation(() => {
        throw new Error('Cookie error');
      });
      localStorageMock.getItem.mockReturnValue('nb');
      const result = getPersistedLocale();
      expect(result).toBe('nb');
    });
  });

  describe('persistLocale', () => {
    it('should write to both cookie and localStorage (dual-write)', () => {
      persistLocale('nb');
      expect(Cookies.set).toHaveBeenCalledWith(
        'digilist_locale',
        'nb',
        expect.any(Object)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'nb');
    });

    it('should write en locale to both storages', () => {
      persistLocale('en');
      expect(Cookies.set).toHaveBeenCalledWith(
        'digilist_locale',
        'en',
        expect.any(Object)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'en');
    });

    it('should continue with localStorage write even if cookie write fails', () => {
      vi.mocked(Cookies.set).mockImplementation(() => {
        throw new Error('Cookie error');
      });
      // Should not throw and should still attempt localStorage write
      expect(() => persistLocale('nb')).not.toThrow();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('locale', 'nb');
    });
  });

  describe('clearPersistedLocale', () => {
    it('should remove from both cookie and localStorage', () => {
      clearPersistedLocale();
      expect(Cookies.remove).toHaveBeenCalledWith('digilist_locale');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('locale');
    });

    it('should continue with localStorage removal even if cookie removal fails', () => {
      vi.mocked(Cookies.remove).mockImplementation(() => {
        throw new Error('Cookie removal error');
      });
      // Should not throw and should still attempt localStorage removal
      expect(() => clearPersistedLocale()).not.toThrow();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('locale');
    });
  });

  describe('Storage key constants', () => {
    it('should use digilist_locale as cookie name', () => {
      getCookieLocale();
      expect(Cookies.get).toHaveBeenCalledWith('digilist_locale');
    });

    it('should use locale as localStorage key', () => {
      getLocalStorageLocale();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('locale');
    });
  });

  describe('Cookie options', () => {
    it('should set cookie with 365 days expiry', () => {
      setCookieLocale('nb');
      expect(Cookies.set).toHaveBeenCalledWith(
        'digilist_locale',
        'nb',
        expect.objectContaining({
          expires: 365,
        })
      );
    });

    it('should set cookie with SameSite=lax', () => {
      setCookieLocale('en');
      expect(Cookies.set).toHaveBeenCalledWith(
        'digilist_locale',
        'en',
        expect.objectContaining({
          sameSite: 'lax',
        })
      );
    });
  });
});
