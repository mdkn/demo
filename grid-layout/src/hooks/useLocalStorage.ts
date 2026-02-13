import { useState, useEffect } from 'react';

/**
 * Type-safe JSON parse wrapper with validation
 * Parses JSON and validates against expected type structure
 *
 * Note: This function intentionally works with JSON.parse's any return type
 * and performs basic runtime validation. For production use, consider adding
 * a schema validation library like zod.
 */
const parseJSON = <T,>(value: string, fallback: T): T => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(value);
    // Basic runtime check - if parsed value is null/undefined, use fallback
    if (parsed === null || parsed === undefined) {
      return fallback;
    }
    // Trust that the parsed structure matches T
    // In production, you would add runtime validation here (e.g., using zod)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return parsed;
  } catch {
    return fallback;
  }
};

/**
 * Custom hook for syncing state with localStorage
 * @param key - localStorage key
 * @param initialValue - fallback value if localStorage is empty
 * @returns tuple of [value, setValue]
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  // Initialize state from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }
      return parseJSON(item, initialValue);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      // Handle quota exceeded or other localStorage errors
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      } else {
        console.error(`Error writing to localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
