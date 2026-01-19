/**
 * Utility Hooks
 *
 * Reusable React hooks for common patterns.
 * SSR-safe implementations.
 *
 * @module @xala/ds/hooks
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// =============================================================================
// useDebounce
// =============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// useThrottle
// =============================================================================

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// =============================================================================
// useLocalStorage
// =============================================================================

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Failed to save to localStorage: ${error}`);
          }
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

// =============================================================================
// useSessionStorage
// =============================================================================

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Failed to save to sessionStorage: ${error}`);
          }
        }
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

// =============================================================================
// useMediaQuery
// =============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// =============================================================================
// useBreakpoint
// =============================================================================

const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function useBreakpoint(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean; isLargeDesktop: boolean } {
  const sm = useMediaQuery(breakpoints.sm);
  const md = useMediaQuery(breakpoints.md);
  const lg = useMediaQuery(breakpoints.lg);
  const xl = useMediaQuery(breakpoints.xl);

  return useMemo(
    () => ({
      isMobile: !sm,
      isTablet: sm && !lg,
      isDesktop: lg,
      isLargeDesktop: xl,
    }),
    [sm, lg, xl]
  );
}

// =============================================================================
// useClickOutside
// =============================================================================

export function useClickOutside<T extends HTMLElement>(callback: () => void): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// =============================================================================
// useKeyPress
// =============================================================================

export function useKeyPress(targetKey: string, callback: () => void, modifiers?: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== targetKey) return;
      if (modifiers?.ctrl && !e.ctrlKey) return;
      if (modifiers?.meta && !e.metaKey) return;
      if (modifiers?.shift && !e.shiftKey) return;
      if (modifiers?.alt && !e.altKey) return;
      callback();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [targetKey, callback, modifiers]);
}

// =============================================================================
// useCopyToClipboard
// =============================================================================

export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopied(false);
    }
  }, []);

  return [copied, copy];
}

// =============================================================================
// useToggle
// =============================================================================

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

// =============================================================================
// usePrevious
// =============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// =============================================================================
// useInterval
// =============================================================================

export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// =============================================================================
// useTimeout
// =============================================================================

export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

// =============================================================================
// useDocumentTitle
// =============================================================================

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const prevTitle = document.title;
      document.title = title;
      return () => {
        document.title = prevTitle;
      };
    }
  }, [title]);
}

// =============================================================================
// useOnlineStatus
// =============================================================================

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// =============================================================================
// useScrollPosition
// =============================================================================

export function useScrollPosition(): { x: number; y: number } {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({ x: window.scrollX, y: window.scrollY });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

// =============================================================================
// useWindowSize
// =============================================================================

export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// =============================================================================
// useFocus
// =============================================================================

export function useFocus<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  return [ref, isFocused];
}
