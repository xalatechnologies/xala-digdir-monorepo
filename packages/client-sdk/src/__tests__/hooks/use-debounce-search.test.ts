/**
 * Unit Tests for useDebounceSearch Hook
 * Tests that verify the debounce search hook functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounceSearch } from '../../hooks/use-debounce-search';

describe('useDebounceSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with empty string by default', () => {
      const { result } = renderHook(() => useDebounceSearch());

      expect(result.current.value).toBe('');
      expect(result.current.debouncedValue).toBe('');
      expect(typeof result.current.setValue).toBe('function');
    });

    it('should initialize with provided initial value', () => {
      const initialValue = 'test query';
      const { result } = renderHook(() => useDebounceSearch(initialValue));

      expect(result.current.value).toBe(initialValue);
      expect(result.current.debouncedValue).toBe(initialValue);
    });

    it('should use default delay of 400ms', () => {
      const { result } = renderHook(() => useDebounceSearch(''));

      act(() => {
        result.current.setValue('test');
      });

      expect(result.current.value).toBe('test');
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(399);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe('test');
    });

    it('should accept custom delay parameter', () => {
      const customDelay = 1000;
      const { result } = renderHook(() => useDebounceSearch('', customDelay));

      act(() => {
        result.current.setValue('custom delay');
      });

      expect(result.current.value).toBe('custom delay');
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe('custom delay');
    });
  });

  describe('Immediate Value Updates', () => {
    it('should update immediate value synchronously', () => {
      const { result } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('immediate');
      });

      expect(result.current.value).toBe('immediate');
      expect(result.current.debouncedValue).toBe('');
    });

    it('should handle multiple rapid updates', () => {
      const { result } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('a');
      });
      expect(result.current.value).toBe('a');

      act(() => {
        result.current.setValue('ab');
      });
      expect(result.current.value).toBe('ab');

      act(() => {
        result.current.setValue('abc');
      });
      expect(result.current.value).toBe('abc');

      // Debounced value should still be empty
      expect(result.current.debouncedValue).toBe('');
    });

    it('should handle empty string updates', () => {
      const { result } = renderHook(() => useDebounceSearch('initial'));

      act(() => {
        result.current.setValue('');
      });

      expect(result.current.value).toBe('');
      expect(result.current.debouncedValue).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe('');
    });
  });

  describe('Debounce Behavior', () => {
    it('should debounce value after default 400ms delay', () => {
      const { result } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('debounced');
      });

      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe('debounced');
    });

    it('should reset timer on new value update', () => {
      const { result } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('first');
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        result.current.setValue('second');
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current.debouncedValue).toBe('second');
    });

    it('should only trigger debounce once after rapid typing', () => {
      const { result } = renderHook(() => useDebounceSearch());

      // Simulate rapid typing
      act(() => {
        result.current.setValue('t');
        vi.advanceTimersByTime(50);
        result.current.setValue('te');
        vi.advanceTimersByTime(50);
        result.current.setValue('tes');
        vi.advanceTimersByTime(50);
        result.current.setValue('test');
      });

      // Debounced value should still be empty
      expect(result.current.debouncedValue).toBe('');

      // Advance past the debounce delay
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Should only have the final value
      expect(result.current.debouncedValue).toBe('test');
    });

    it('should handle custom delay correctly', () => {
      const { result } = renderHook(() => useDebounceSearch('', 1000));

      act(() => {
        result.current.setValue('custom');
      });

      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.debouncedValue).toBe('custom');
    });
  });

  describe('Cleanup Behavior', () => {
    it('should cleanup timer on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const { result, unmount } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('cleanup test');
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should cleanup timer on value change', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const { result } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('first');
      });

      const callCountAfterFirst = clearTimeoutSpy.mock.calls.length;

      act(() => {
        result.current.setValue('second');
      });

      // Should have been called again to clear previous timer
      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(callCountAfterFirst);
    });

    it('should not update debounced value after unmount', () => {
      const { result, unmount } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('unmounted');
      });

      const valueBeforeUnmount = result.current.debouncedValue;
      unmount();

      act(() => {
        vi.advanceTimersByTime(400);
      });

      // Value should not have changed after unmount
      expect(result.current.debouncedValue).toBe(valueBeforeUnmount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle same value updates', () => {
      const { result } = renderHook(() => useDebounceSearch('initial'));

      act(() => {
        result.current.setValue('initial');
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.value).toBe('initial');
      expect(result.current.debouncedValue).toBe('initial');
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useDebounceSearch());

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      act(() => {
        result.current.setValue(specialChars);
      });

      expect(result.current.value).toBe(specialChars);

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe(specialChars);
    });

    it('should handle unicode characters', () => {
      const { result } = renderHook(() => useDebounceSearch());

      const unicode = 'Hello 世界 🌍';
      act(() => {
        result.current.setValue(unicode);
      });

      expect(result.current.value).toBe(unicode);

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe(unicode);
    });

    it('should handle whitespace correctly', () => {
      const { result } = renderHook(() => useDebounceSearch());

      act(() => {
        result.current.setValue('  spaces  ');
      });

      expect(result.current.value).toBe('  spaces  ');

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe('  spaces  ');
    });

    it('should handle zero delay', () => {
      const { result } = renderHook(() => useDebounceSearch('', 0));

      act(() => {
        result.current.setValue('zero delay');
      });

      expect(result.current.value).toBe('zero delay');

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current.debouncedValue).toBe('zero delay');
    });
  });

  describe('Type Safety', () => {
    it('should return object with correct structure', () => {
      const { result } = renderHook(() => useDebounceSearch());

      expect(result.current).toHaveProperty('value');
      expect(result.current).toHaveProperty('debouncedValue');
      expect(result.current).toHaveProperty('setValue');
      expect(typeof result.current.value).toBe('string');
      expect(typeof result.current.debouncedValue).toBe('string');
      expect(typeof result.current.setValue).toBe('function');
    });

    it('should maintain referential stability of setValue', () => {
      const { result, rerender } = renderHook(() => useDebounceSearch());

      const firstSetValue = result.current.setValue;

      act(() => {
        result.current.setValue('test');
      });

      rerender();

      // setValue should maintain referential stability
      expect(result.current.setValue).toBe(firstSetValue);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should simulate search input typing', () => {
      const { result } = renderHook(() => useDebounceSearch());
      const searchTerm = 'react hooks';

      // Simulate typing character by character
      const chars = searchTerm.split('');
      chars.forEach((char, index) => {
        act(() => {
          result.current.setValue(searchTerm.substring(0, index + 1));
          vi.advanceTimersByTime(50); // 50ms between keystrokes
        });
      });

      // Debounced value should still be empty
      expect(result.current.debouncedValue).toBe('');

      // Wait for debounce to complete
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe(searchTerm);
    });

    it('should handle user pausing while typing', () => {
      const { result } = renderHook(() => useDebounceSearch());

      // User types "react"
      act(() => {
        result.current.setValue('react');
        vi.advanceTimersByTime(100);
      });

      // User pauses but not long enough
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current.debouncedValue).toBe('');

      // User continues typing " hooks"
      act(() => {
        result.current.setValue('react hooks');
      });

      // Complete the debounce
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe('react hooks');
    });

    it('should handle clearing search', () => {
      const { result } = renderHook(() => useDebounceSearch('initial search'));

      // Clear the search
      act(() => {
        result.current.setValue('');
      });

      expect(result.current.value).toBe('');
      expect(result.current.debouncedValue).toBe('initial search');

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.debouncedValue).toBe('');
    });
  });
});
