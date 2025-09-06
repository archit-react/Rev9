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
    // atob expects proper padding
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
  const token = localStorage.getItem("token");

  // If no token or expired/invalid, clear and redirect to login
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the page (prefer children, fallback to element)
  return <>{children || element}</>;
}
