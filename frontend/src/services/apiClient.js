const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";

function getBaseUrl() {
  let stored =
    typeof window !== "undefined"
      ? window.localStorage.getItem("argus:apiBaseUrl")
      : null;

  if (stored) {
    try {
      stored = JSON.parse(stored);
    } catch {}
  }

  return stored || import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet(path, params = {}, { timeoutMs = 120000 } = {}) {
  const url = new URL(`${getBaseUrl()}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.warn(`Request timed out after ${timeoutMs} ms`);
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        detail = body.detail || body.message || detail;
      } catch {
        // response wasn't JSON — keep statusText
      }
      throw new ApiError(detail, response.status);
    }

    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("The request timed out. Is the backend running?", 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError("Could not reach the backend. Check that it's running and the API URL is correct.", 0);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiDelete(path, { timeoutMs = 30000 } = {}) {
  const url = new URL(`${getBaseUrl()}${path}`);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.warn(`Request timed out after ${timeoutMs} ms`);
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url.toString(), { method: "DELETE", signal: controller.signal });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        detail = body.detail || body.message || detail;
      } catch {
        // response wasn't JSON — keep statusText
      }
      throw new ApiError(detail, response.status);
    }

    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("The request timed out. Is the backend running?", 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError("Could not reach the backend. Check that it's running and the API URL is correct.", 0);
  } finally {
    clearTimeout(timer);
  }
}

export { getBaseUrl, DEFAULT_BASE_URL };
