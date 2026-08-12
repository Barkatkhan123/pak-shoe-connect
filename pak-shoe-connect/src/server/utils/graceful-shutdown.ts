/**
 * Graceful Shutdown Handler
 *
 * Ensures clean process termination during ECS rolling deployments:
 *   SIGTERM → stop new requests → drain in-flight → close DB → exit 0
 *
 * The drain timeout (15s) is coordinated with the ECS task stopTimeout (default 30s)
 * to ensure the orchestrator doesn't SIGKILL before cleanup completes.
 */

import { prisma } from "../db";

const DRAIN_TIMEOUT_MS = 15_000;

let isShuttingDown = false;
let activeRequests = 0;

/** Call at the start of each request handler to track in-flight count. */
export function onRequestStart(): void {
  activeRequests++;
}

/** Call at the end of each request handler. */
export function onRequestEnd(): void {
  activeRequests = Math.max(0, activeRequests - 1);
}

/** Returns true if the server is draining and should reject new work. */
export function isServerShuttingDown(): boolean {
  return isShuttingDown;
}

/**
 * Register shutdown handlers. Call once at server startup.
 * Idempotent — multiple calls are safe.
 */
export function registerGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return; // Prevent re-entry
    isShuttingDown = true;

    console.info(
      JSON.stringify({
        event: "SHUTDOWN_INITIATED",
        signal,
        activeRequests,
        drainTimeoutMs: DRAIN_TIMEOUT_MS,
        ts: new Date().toISOString(),
      }),
    );

    // Wait for in-flight requests to drain, up to the timeout
    const deadline = Date.now() + DRAIN_TIMEOUT_MS;
    while (activeRequests > 0 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    if (activeRequests > 0) {
      console.warn(
        JSON.stringify({
          event: "SHUTDOWN_DRAIN_TIMEOUT",
          remainingRequests: activeRequests,
          ts: new Date().toISOString(),
        }),
      );
    } else {
      console.info(
        JSON.stringify({
          event: "SHUTDOWN_DRAIN_COMPLETE",
          ts: new Date().toISOString(),
        }),
      );
    }

    // Close database & queue connections
    try {
      await prisma.$disconnect();
      const { redisConnection, whatsappQueue } = await import("../queues/whatsapp.queue").catch(() => ({} as any));
      if (whatsappQueue?.close) await whatsappQueue.close().catch(() => {});
      if (redisConnection?.quit) await redisConnection.quit().catch(() => {});
      console.info(
        JSON.stringify({
          event: "SHUTDOWN_DB_DISCONNECTED",
          ts: new Date().toISOString(),
        }),
      );
    } catch (err) {
      console.error(
        JSON.stringify({
          event: "SHUTDOWN_DB_DISCONNECT_ERROR",
          error: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString(),
        }),
      );
    }

    console.info(
      JSON.stringify({
        event: "SHUTDOWN_COMPLETE",
        signal,
        ts: new Date().toISOString(),
      }),
    );

    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
