import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay (ms).
 * Useful for search inputs to avoid firing API calls on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
