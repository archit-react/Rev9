// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
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

    // base64url -> base64
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    const json = atob(b64 + pad);
    const payload = JSON.parse(json) as JwtPayload;

    if (!payload.exp) return true; // no exp -> treat as valid
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false; // malformed/unparseable -> treat as invalid
  }
}

export default function ProtectedRoute({
  element,
  children,
}: ProtectedRouteProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // If no token or expired/invalid, clear and redirect to login
  if (!token || !isTokenValid(token)) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // preserve the place the user tried to go
      const next = window.location.pathname + window.location.search;
      return (
        <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
      );
    }
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the page (prefer children, fallback to element)
  return <>{children || element}</>;
}
