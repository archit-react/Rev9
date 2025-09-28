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

  if (!token || !isTokenValid(token)) {
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

  return <>{children || element}</>;
}
