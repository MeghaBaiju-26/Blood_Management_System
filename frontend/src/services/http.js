import { clearSession, getAccessToken, setSession } from "../auth/session";

const API_BASE = "http://localhost:5000";
let refreshInFlight = null;
let fetchInstalled = false;
let nativeFetchRef = null;

function toApiUrl(input) {
  if (typeof input !== "string") return input;

  if (input.startsWith("http://localhost:5000")) {
    return input;
  }

  if (input.startsWith("/api/")) {
    return `${API_BASE}${input}`;
  }

  if (input.startsWith("/")) {
    return `${API_BASE}${input}`;
  }

  return input;
}

async function refreshSession() {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const rawFetch = nativeFetchRef || window.fetch.bind(window);
    const res = await rawFetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    const data = await res.json();
    if (!data?.access_token || !data?.user) {
      clearSession();
      return null;
    }

    setSession({
      accessToken: data.access_token,
      user: data.user,
    });

    return data.access_token;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function apiFetch(path, options = {}) {
  const rawFetch = nativeFetchRef || window.fetch.bind(window);
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await rawFetch(toApiUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status !== 401) {
    return response;
  }

  const nextToken = await refreshSession();
  if (!nextToken) {
    return response;
  }

  const retryHeaders = new Headers(options.headers || {});
  if (!retryHeaders.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    retryHeaders.set("Content-Type", "application/json");
  }
  retryHeaders.set("Authorization", `Bearer ${nextToken}`);

  return rawFetch(toApiUrl(path), {
    ...options,
    headers: retryHeaders,
    credentials: "include",
  });
}

export function installAuthenticatedFetch() {
  if (fetchInstalled || typeof window === "undefined" || !window.fetch) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);
  nativeFetchRef = nativeFetch;
  window.fetch = async (input, init = {}) => {
    const mapped = toApiUrl(input);
    const isApiCall =
      typeof mapped === "string" &&
      (mapped.startsWith(`${API_BASE}/`) || mapped.startsWith("/api/"));

    if (!isApiCall) {
      return nativeFetch(input, init);
    }

    const token = getAccessToken();
    const headers = new Headers(init.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const first = await nativeFetch(mapped, {
      ...init,
      headers,
      credentials: "include",
    });

    if (first.status !== 401) {
      return first;
    }

    const nextToken = await refreshSession();
    if (!nextToken) {
      return first;
    }

    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${nextToken}`);

    return nativeFetch(mapped, {
      ...init,
      headers: retryHeaders,
      credentials: "include",
    });
  };

  fetchInstalled = true;
}
