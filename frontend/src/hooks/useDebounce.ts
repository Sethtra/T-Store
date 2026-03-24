import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value by a specified delay.
 * Useful for delaying API calls until the user stops typing.
 *
 * @param value - The value to debounce (e.g., a search query string).
 * @param delay - The debounce delay in milliseconds (default: 500ms).
 * @returns The debounced value, which updates only after `delay` ms of inactivity.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
