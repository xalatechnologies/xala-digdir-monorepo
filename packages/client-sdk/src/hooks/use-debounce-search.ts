/**
 * Debounce Search Hook
 * Single Responsibility: Provides debounced value for search inputs
 */

import { useState, useEffect } from 'react';

/**
 * Hook to debounce search input values
 *
 * @param initialValue - The initial search value
 * @param delay - Debounce delay in milliseconds (default: 400)
 * @returns Object containing:
 *   - value: The immediate (non-debounced) value
 *   - debouncedValue: The debounced value
 *   - setValue: Function to update the immediate value
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const { value, debouncedValue, setValue } = useDebounceSearch('', 400);
 *
 *   useEffect(() => {
 *     // Trigger search with debouncedValue
 *     if (debouncedValue) {
 *       performSearch(debouncedValue);
 *     }
 *   }, [debouncedValue]);
 *
 *   return (
 *     <input
 *       value={value}
 *       onChange={(e) => setValue(e.target.value)}
 *     />
 *   );
 * }
 * ```
 */
export function useDebounceSearch(initialValue: string = '', delay: number = 400) {
  const [value, setValue] = useState<string>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<string>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return {
    value,
    debouncedValue,
    setValue,
  };
}
