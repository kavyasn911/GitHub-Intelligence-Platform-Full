import { useEffect, useState } from "react";

// Generic loading/error/data wrapper for backend calls. Kept deliberately
// simple (no caching/retry policy) since each dashboard widget fails
// independently and shouldn't block the rest of the page.
export function useAsyncData(fetcher, deps = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", data: null, error: err.message || "Request failed." });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
