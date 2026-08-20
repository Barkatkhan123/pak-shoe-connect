import Redis from "ioredis";

/**
 * Shared Redis connection for the payment services subsystem.
 * Skips gracefully when Redis is not configured in serverless/test environment.
 */
export const paymentRedis: any = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy() {
        return null;
      },
      keyPrefix: "shersha:payment:",
    })
  : {
      get: async () => null,
      set: async () => "OK",
      del: async () => 1,
      on: () => {},
    };

if (paymentRedis?.on) {
  paymentRedis.on("error", () => {});
}
