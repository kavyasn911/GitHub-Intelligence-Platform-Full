import { useCallback, useState } from "react";

// Same idea as useLocalStorage, but backed by sessionStorage: state persists
// when navigating between pages in the app (since the tab stays open), but
// resets on a full browser/tab close — useful for "don't lose my last search
// result when I click away and come back" without permanently caching it.
export function useSessionStorage(key, initialValue) {

  const readValue = () => {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (next) => {
      setStoredValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.sessionStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage full or unavailable — state still updates in memory
        }
        return resolved;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove];
}
