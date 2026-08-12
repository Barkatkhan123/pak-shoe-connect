import crypto from "crypto";

/**
 * Correlation ID Middleware
 *
 * Generates a unique request ID for every inbound request.
 * Used for end-to-end tracing across logs without exposing internal systems.
 *
 * Format: REQ-<timestamp-hex>-<random-hex>
 * Example: REQ-019234ABCD-F3A1B2C4
 */
export function generateCorrelationId(): string {
  const ts = Date.now().toString(16).toUpperCase();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `REQ-${ts}-${rand}`;
}

export interface RequestContext {
  correlationId: string;
  startedAt: number;
  userId?: string;
  role?: string;
  path: string;
  method: string;
}

export function createRequestContext(path: string, method: string, headers: Record<string, string> = {}): RequestContext {
  const correlationId = headers["x-correlation-id"] || headers["X-Correlation-Id"] || generateCorrelationId();
  return {
    correlationId,
    startedAt: Date.now(),
    path,
    method,
  };
}
