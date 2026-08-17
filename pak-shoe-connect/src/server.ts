import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { apiGateway } from "./server/gateway/gateway";
import { getOrCreateCorrelationId } from "./server/middleware/correlation.middleware";
import { validatePaymentConfig } from "./server/utils/startup-validation";
import {
  registerGracefulShutdown,
  onRequestStart,
  onRequestEnd,
  isServerShuttingDown,
} from "./server/utils/graceful-shutdown";
import { prisma } from "./server/db";

// ── Boot-time initialization ──────────────────────────────────────────────

const isVercel = !!process.env.VERCEL;

// 1. Validate all required env vars before accepting traffic
validatePaymentConfig();

// 2. Register graceful shutdown handlers (SIGTERM / SIGINT)
// Vercel serverless functions don't support persistent process lifecycle
if (!isVercel) {
  registerGracefulShutdown();
}

// ── Security Headers ──────────────────────────────────────────────────────

/**
 * Production security headers applied to ALL responses (SSR + API).
 *
 * Note: HSTS is only added when the request arrived over TLS (checked via
 * x-forwarded-proto, set by ALB / CloudFront). This avoids HSTS lock-in
 * during local HTTP development.
 */
function applySecurityHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS only when behind TLS termination (ALB / CloudFront sets this header)
  const proto = request.headers.get("x-forwarded-proto") ?? "";
  if (proto === "https" || process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ── Health Probes ─────────────────────────────────────────────────────────

/**
 * Lightweight liveness probe.
 * Returns 200 if the process event loop is responsive.
 * No external dependency checks — that's readiness.
 */
function liveProbe(): Response {
  return new Response(
    JSON.stringify({
      status: "UP",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Readiness probe.
 * Returns 200 only if the database is reachable.
 * ECS / Kubernetes won't route traffic until this passes.
 */
async function readyProbe(): Promise<Response> {
  const checks: Record<string, "connected" | "unreachable"> = {
    database: "unreachable",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch {
    // Database unreachable — readiness fails
  }

  const allHealthy = Object.values(checks).every((v) => v === "connected");

  return new Response(
    JSON.stringify({
      status: allHealthy ? "READY" : "NOT_READY",
      services: checks,
      timestamp: new Date().toISOString(),
    }),
    {
      status: allHealthy ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}

// ── SSR Entry Loader ──────────────────────────────────────────────────────

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// ── Main Fetch Handler ────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // ── Health probes (exempt from shutdown gate & security headers) ───
    if (url.pathname === "/health/live" || url.pathname === "/health") {
      return liveProbe();
    }
    if (url.pathname === "/health/ready") {
      return readyProbe();
    }

    // ── Shutdown gate: reject new requests if draining ────────────────
    if (isServerShuttingDown()) {
      return new Response(
        JSON.stringify({
          status: "SERVICE_UNAVAILABLE",
          message: "Server is shutting down",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            Connection: "close",
          },
        },
      );
    }

    // ── Track in-flight requests for graceful shutdown ────────────────
    onRequestStart();
    try {
      // ── API Gateway ────────────────────────────────────────────────
      if (url.pathname.startsWith("/api/")) {
        const correlationId = getOrCreateCorrelationId(request.headers);

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
          return applySecurityHeaders(
            new Response(null, {
              status: 204,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers":
                  "Content-Type, Authorization, x-signature, x-idempotency-key, x-correlation-id",
                "X-Correlation-ID": correlationId,
              },
            }),
            request,
          );
        }

        try {
          let body: any = {};
          const queryParams = Object.fromEntries(url.searchParams.entries());
          const headers: Record<string, string> = {};
          request.headers.forEach((val, key) => {
            headers[key] = val;
          });
          headers["x-correlation-id"] = correlationId;

          if (["POST", "PUT", "PATCH"].includes(request.method)) {
            // Read body as raw text first to preserve exact bytes for
            // HMAC signature verification on payment webhooks
            let rawText = "";
            try {
              rawText = await request.text();
            } catch {
              rawText = "";
            }
            headers["x-raw-body"] = rawText;

            const contentType = request.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              try {
                body = JSON.parse(rawText);
              } catch {
                body = {};
              }
            } else {
              body = rawText;
            }
          }

          const rawFwd = headers["x-forwarded-for"];
          const clientIp = rawFwd
            ? rawFwd
                .split(",")
                .map((s) => s.trim())
                .pop() || "127.0.0.1"
            : headers["x-real-ip"] || "127.0.0.1";

          const apiResponse = await apiGateway(
            url.pathname,
            request.method,
            body,
            queryParams,
            headers,
            clientIp,
          );

          return applySecurityHeaders(
            new Response(JSON.stringify(apiResponse.body), {
              status: apiResponse.status,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers":
                  "Content-Type, Authorization, x-signature, x-idempotency-key, x-correlation-id",
                "X-Correlation-ID": correlationId,
                ...(apiResponse.headers || {}),
              },
            }),
            request,
          );
        } catch (error: any) {
          console.error("API Gateway Exception:", error);
          return applySecurityHeaders(
            new Response(
              JSON.stringify({
                success: false,
                error: {
                  code: "INTERNAL_SERVER_ERROR",
                  message: "An internal server error occurred",
                  correlationId,
                },
              }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "X-Correlation-ID": correlationId,
                },
              },
            ),
            request,
          );
        }
      }

      // ── SSR / Web Application requests ─────────────────────────────
      try {
        const handler = await getServerEntry();
        const response = await handler.fetch(request, env, ctx);
        const normalized = await normalizeCatastrophicSsrResponse(response);
        return applySecurityHeaders(normalized, request);
      } catch (error) {
        console.error(error);
        return applySecurityHeaders(
          new Response(renderErrorPage(), {
            status: 500,
            headers: { "content-type": "text/html; charset=utf-8" },
          }),
          request,
        );
      }
    } finally {
      onRequestEnd();
    }
  },
};
