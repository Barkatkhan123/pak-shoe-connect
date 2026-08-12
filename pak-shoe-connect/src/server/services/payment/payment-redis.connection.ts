import Redis from "ioredis";

/**
 * Shared Redis connection for the payment services subsystem.
 * Falls back gracefully when local Redis is not running.
 */
export const paymentRedis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy() {
    // Return null to disable auto-reconnect loops when Redis server is offline
    return null;
  },
  keyPrefix: "shersha:payment:",
});

// Suppress unhandled error events in dev/test environment
paymentRedis.on("error", () => {
  // Silent fallback
});
