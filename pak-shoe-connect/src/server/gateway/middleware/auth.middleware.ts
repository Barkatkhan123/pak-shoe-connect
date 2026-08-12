import crypto from "crypto";
import type { RequestContext } from "./correlation-id.middleware";

/**
 * JWT Authentication Middleware — Zero Trust
 *
 * Zero Trust rules:
 *  - NEVER trust userId, role, supplierId, or walletId from request body/query.
 *  - Identity MUST come from the verified JWT token ONLY.
 *  - Token must be signed with HMAC-SHA256 (HS256).
 *  - Expired tokens are rejected.
 *  - Tampered tokens are rejected.
 *  - Missing tokens on protected routes are rejected with 401.
 *
 * The JWT secret is NEVER exposed to clients under any circumstance.
 */

export interface AuthToken {
  sub: string;          // internal userId — NEVER sent to client directly
  role: "BUYER" | "SUPPLIER" | "OPERATOR" | "ADMIN" | "SUPER_ADMIN";
  supplierId?: string;  // internal — NEVER sent to client directly
  iat: number;
  exp: number;
  jti: string;          // unique token ID for revocation
}

export interface AuthResult {
  authenticated: boolean;
  token?: AuthToken;
  error?: string;
}

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("[Auth] JWT_SECRET env variable is required in production");
  }
  return secret || "shersha_dev_jwt_secret_not_for_production_2026";
})();

/** Simple base64url encode (no external dep) */
function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** Decodes a base64url segment */
function b64urlDecode(input: string): string {
  const padded = input + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

/** Issues a signed JWT (for auth endpoint use only) */
export function signToken(payload: Omit<AuthToken, "iat" | "exp" | "jti">, expiresInSeconds = 3600): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    jti: crypto.randomBytes(8).toString("hex"),
  }));
  const sig = b64url(
    crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${sig}`;
}

/** Verifies and decodes a JWT — returns null if invalid/expired/tampered */
export function verifyToken(token: string): AuthToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = b64url(
      crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
    );

    // Timing-safe comparison — prevents signature oracle attacks
    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const claims: AuthToken = JSON.parse(b64urlDecode(body));
    const now = Math.floor(Date.now() / 1000);

    if (claims.exp < now) return null; // Expired

    return claims;
  } catch {
    return null;
  }
}

/** Extracts Bearer token from Authorization header */
export function extractBearerToken(headers: Record<string, string>): string | null {
  const authHeader = headers["authorization"] || headers["Authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

/**
 * Authenticates a request using the Authorization header.
 * Returns the decoded token on success.
 * NEVER trusts userId/role from request body.
 */
export function authenticate(headers: Record<string, string>): AuthResult {
  const raw = extractBearerToken(headers);
  if (!raw) {
    return { authenticated: false, error: "Authentication required" };
  }

  const token = verifyToken(raw);
  if (!token) {
    return { authenticated: false, error: "Invalid or expired token" };
  }

  return { authenticated: true, token };
}

/**
 * Authorizes that the authenticated user has the required role.
 * Also verifies ownership where applicable.
 */
export function authorize(
  token: AuthToken,
  requiredRoles: AuthToken["role"][],
  options?: { ownerId?: string }
): { authorized: boolean; reason?: string } {
  if (!requiredRoles.includes(token.role)) {
    return { authorized: false, reason: "Insufficient permissions" };
  }

  // Ownership check: if ownerId is provided, the token's sub must match
  if (options?.ownerId && token.role !== "ADMIN" && token.role !== "OPERATOR") {
    if (token.sub !== options.ownerId && token.supplierId !== options.ownerId) {
      return { authorized: false, reason: "Access denied" };
    }
  }

  return { authorized: true };
}

/** Context mutator — attaches verified identity to request context */
export function attachIdentity(ctx: RequestContext, token: AuthToken): void {
  // Only expose non-sensitive identifier for logging (not the full sub)
  ctx.userId = token.sub.slice(0, 8) + "…"; // Truncated for logs — never full UUID
  ctx.role = token.role;
}
