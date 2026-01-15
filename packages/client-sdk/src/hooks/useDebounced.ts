import { useState, useEffect } from 'react';

/**
 * Debounce a value with configurable delay
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 400)
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [searchValue, setSearchValue] = useState('');
 * const debouncedSearch = useDebounced(searchValue, 400);
 *
 * useEffect(() => {
 *   // This only runs 400ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounced<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
