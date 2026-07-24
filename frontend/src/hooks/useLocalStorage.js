import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {

  const readValue = () => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      window.dispatchEvent(
        new StorageEvent("storage", {
          key,
          newValue: JSON.stringify(value),
        })
      );
    } catch {}
  }, [key, value]);

  useEffect(() => {

    const sync = (event) => {
      if (event.key !== key) return;
      setValue(readValue());
    };

    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("storage", sync);
    };

  }, [key]);

  const remove = useCallback(() => {

    window.localStorage.removeItem(key);

    setValue(initialValue);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: null,
      })
    );

  }, [key, initialValue]);

  return [value, setValue, remove];

}
