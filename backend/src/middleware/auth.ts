// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization; // express normalizes header keys
  const hasBearer =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ");
  const token = hasBearer
    ? authHeader.slice("Bearer ".length).trim()
    : undefined;

  if (!token) {
    res.set(
      "WWW-Authenticate",
      'Bearer realm="api", error="invalid_request", error_description="No token provided"'
    );
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // JWT secret must be defined; fail fast rather than accepting tokens
    return res.status(500).json({ error: "Server misconfiguration." });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    const description =
      err instanceof TokenExpiredError ? "Token expired." : "Invalid token.";
    res.set(
      "WWW-Authenticate",
      `Bearer realm="api", error="invalid_token", error_description="${description}"`
    );
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
