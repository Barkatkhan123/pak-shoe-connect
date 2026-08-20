import type { RequestContext } from "./correlation-id.middleware";

/**
 * Error Normalization Middleware — Zero Trust API Gateway
 *
 * NEVER exposes:
 *   - Stack traces
 *   - Prisma / SQL errors
 *   - Internal error codes
 *   - Service names
 *   - File paths
 *   - Redis keys
 *   - Queue names
 *   - Database schema
 *   - Internal IDs
 *
 * All errors are mapped to normalized, client-safe responses.
 * Technical details are logged internally with the correlation ID.
 */

export interface GatewayError {
  success: false;
  message: string;
  error?: string;
  code: string;
  correlationId: string;
}

/** Maps internal error types to safe client-facing messages */
const ERROR_MAP: Record<string, { message: string; status: number; code: string }> = {
  // Prisma errors — never expose P-codes
  PrismaClientKnownRequestError: {
    message: "Unable to process your request.",
    status: 400,
    code: "REQUEST_FAILED",
  },
  PrismaClientValidationError: {
    message: "Invalid data provided.",
    status: 400,
    code: "VALIDATION_ERROR",
  },
  PrismaClientUnknownRequestError: {
    message: "An unexpected error occurred.",
    status: 500,
    code: "INTERNAL_ERROR",
  },
  PrismaClientRustPanicError: {
    message: "Service temporarily unavailable.",
    status: 503,
    code: "SERVICE_UNAVAILABLE",
  },
  // Zod validation
  ZodError: { message: "Request validation failed.", status: 422, code: "VALIDATION_ERROR" },
  // Payment errors
  PaymentVerificationError: {
    message: "Payment could not be verified.",
    status: 400,
    code: "PAYMENT_FAILED",
  },
  EscrowTransitionError: {
    message: "Order state could not be updated.",
    status: 409,
    code: "STATE_ERROR",
  },
  // Auth errors
  JsonWebTokenError: { message: "Authentication failed.", status: 401, code: "AUTH_FAILED" },
  TokenExpiredError: { message: "Session has expired.", status: 401, code: "SESSION_EXPIRED" },
  // Default
  DEFAULT: { message: "An unexpected error occurred.", status: 500, code: "INTERNAL_ERROR" },
};

/**
 * Normalizes any thrown error into a safe, client-facing response.
 * Logs full technical details internally with correlation ID.
 */
export function normalizeError(
  error: unknown,
  ctx: RequestContext,
): { status: number; body: GatewayError } {
  const err = error as any;
  if (err?.code === "P2025") {
    return {
      status: 404,
      body: {
        success: false,
        message: "Requested resource not found",
        code: "NOT_FOUND",
        correlationId: ctx.correlationId,
      },
    };
  }

  const name: string = err?.constructor?.name || "DEFAULT";
  const mapping = ERROR_MAP[name] || ERROR_MAP["DEFAULT"];

  // Log full error internally — NEVER send this to client
  console.error(
    JSON.stringify({
      event: "GATEWAY_ERROR",
      correlationId: ctx.correlationId,
      path: ctx.path,
      method: ctx.method,
      userId: ctx.userId,
      errorType: name,
      // Prisma code if present (e.g. P2025) — internal only
      errorCode: err?.code,
      // Message for engineers
      internalMessage: err?.message,
      // Truncated stack — internal only
      stack: err?.stack?.split("\n").slice(0, 5).join(" | "),
      durationMs: Date.now() - ctx.startedAt,
    }),
  );

  return {
    status: mapping.status,
    body: {
      success: false,
      message: err?.message || mapping.message,
      error: err?.message || mapping.message,
      code: mapping.code,
      correlationId: ctx.correlationId, // Safe to expose — for support tracing
    },
  };
}

/** Builds a standard 401 Unauthorized response */
export function unauthorizedResponse(
  message: string,
  correlationId: string,
): { status: 401; body: GatewayError } {
  return {
    status: 401,
    body: { success: false, message, code: "UNAUTHORIZED", correlationId },
  };
}

/** Builds a standard 403 Forbidden response */
export function forbiddenResponse(correlationId: string): { status: 403; body: GatewayError } {
  return {
    status: 403,
    body: { success: false, message: "Access denied.", code: "FORBIDDEN", correlationId },
  };
}

/** Builds a standard 429 Too Many Requests response */
export function rateLimitResponse(
  correlationId: string,
  resetAt: number,
): { status: 429; body: GatewayError & { retryAfter: number } } {
  return {
    status: 429,
    body: {
      success: false,
      message: "Too many requests. Please slow down.",
      code: "RATE_LIMITED",
      correlationId,
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    },
  };
}

/** Builds a standard 422 Validation Error response */
export function validationErrorResponse(
  errors: string[],
  correlationId: string,
): { status: 422; body: GatewayError & { errors: string[] } } {
  return {
    status: 422,
    body: {
      success: false,
      message: "Request validation failed.",
      code: "VALIDATION_ERROR",
      correlationId,
      errors,
    },
  };
}

/** Builds a standard 404 Not Found response */
export function notFoundResponse(correlationId: string): { status: 404; body: GatewayError } {
  return {
    status: 404,
    body: {
      success: false,
      message: "The requested resource was not found.",
      code: "NOT_FOUND",
      correlationId,
    },
  };
}
