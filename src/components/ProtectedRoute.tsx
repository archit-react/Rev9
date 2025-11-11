import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";

interface ProtectedRouteProps {
  element?: ReactElement;
  children?: ReactNode;
}

type JwtPayload = {
  exp?: number; // seconds since epoch
  [k: string]: unknown;
};

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // base64url -> base64 (with padding)
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const json = typeof atob === "function" ? atob(b64 + pad) : "";
    const payload = JSON.parse(json) as JwtPayload;

    if (!payload.exp) return true; // no exp = valid
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({
  element,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // If token exists and is valid, allow.
  if (token && isTokenValid(token)) {
    return <>{children || element}</>;
  }

  // NEW: Accept a demo session if localStorage.user exists and has demo:true
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          demo?: boolean;
          [k: string]: unknown;
        };
        if (parsed?.demo === true) {
          // allow demo users through
          return <>{children || element}</>;
        }
      }
    } catch {
      // parsing error -> fall through to cleanup/redirect
    }
  }

  // no valid token and no demo session -> cleanup and redirect to login
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // legacy cleanup
    } catch {
      // ignore localStorage errors (e.g., Safari private mode)
    }
  }
  const next = `${location.pathname}${location.search || ""}`;
  return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
}
