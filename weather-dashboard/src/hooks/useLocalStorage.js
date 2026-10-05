// Persisted state hook: like useState but mirrored into localStorage
// through our crash-proof `storage` wrapper.
import { useCallback, useState } from 'react';
import { storage } from '../utils/helpers';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = storage.get(key, null);
    return stored === null ? initialValue : stored;
  });

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        storage.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    storage.remove(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, set, remove];
}
