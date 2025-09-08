// src/lib/api.ts

// Use explicit env if provided (e.g. https://api.example.com)
const ENV_API = import.meta.env?.VITE_API_URL?.trim();

// Detect local dev
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "";
const isLocalhost =
  host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";

// Choose base URL:
//    - ENV value beats all
//    - localhost → backend dev server
//    - otherwise → current origin (works with platform rewrites/proxies)
export const API_BASE =
  (ENV_API && ENV_API.replace(/\/+$/, "")) ||
  (isLocalhost
    ? "http://localhost:5001"
    : isBrowser
    ? window.location.origin
    : "");

// Safe path join (prevents double slashes)
const join = (base: string, path: string) => {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
};

// Build absolute URL for API requests
export const api = (path: string) => join(API_BASE, path);

/* ------------------------------------------------------------------ */
/* Auth helpers                                                       */
/* ------------------------------------------------------------------ */

export function authHeaders(): Record<string, string> {
  const token = isBrowser ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type FetchJsonOptions = Omit<RequestInit, "body" | "headers"> & {
  withAuth?: boolean; // set to false to skip attaching the Authorization header
  json?: unknown; // pass a JS object to be JSON.stringified
  headers?: HeadersInit; // keep headers but normalize to HeadersInit here
};

/** Normalize HeadersInit → plain record for safe merging */
function toHeaderRecord(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (typeof Headers !== "undefined" && h instanceof Headers) {
    const obj: Record<string, string> = {};
    h.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  if (Array.isArray(h)) {
    const obj: Record<string, string> = {};
    for (const [key, value] of h) obj[key] = String(value);
    return obj;
  }
  return { ...(h as Record<string, string>) };
}

/**
 * fetchJson:
 *  - defaults credentials to "include" (cookies ready)
 *  - adds Authorization header unless withAuth === false
 *  - JSON.stringifies `options.json` (if provided)
 *  - safely parses JSON and throws on !response.ok
 */
export async function fetchJson<T = unknown>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { withAuth = true, json, headers, ...rest } = options;

  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(withAuth ? authHeaders() : {}),
    ...toHeaderRecord(headers),
  };

  const res = await fetch(api(path), {
    credentials: "include",
    headers: mergedHeaders,
    ...(json !== undefined
      ? { body: JSON.stringify(json), method: "POST" }
      : {}),
    ...rest,
  });

  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    // ignore parse errors; keep as {}
  }

  if (!res.ok) {
    const message =
      (data as { error?: string; message?: string })?.error ||
      (data as { message?: string })?.message ||
      `Request failed (${res.status})`;

    // 401 hint: caller can decide to redirect or show a toast
    throw new Error(message);
  }

  return data as T;
}

/** Clear local auth (token only) + legacy cleanup. */
export function logout() {
  if (!isBrowser) return;
  try {
    localStorage.removeItem("token");
  } catch {
    // ignore localStorage errors (e.g., Safari private mode)
  }
  try {
    // legacy key from older builds — keep cleanup for safety
    localStorage.removeItem("user");
  } catch {
    // ignore localStorage errors
  }
}
