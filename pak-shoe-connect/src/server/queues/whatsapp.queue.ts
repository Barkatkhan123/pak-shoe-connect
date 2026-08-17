import { Queue } from "bullmq";
import Redis from "ioredis";

const isVercel = !!process.env.VERCEL;

// Safe Redis connection initializer (gracefully falls back if Redis is not locally active in dev/test)
// On Vercel serverless, skip entirely — TCP sockets are not viable
export const redisConnection = isVercel
  ? null
  : new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: true,
      retryStrategy(times) {
        if (
          process.env.NODE_ENV === "test" ||
          (!process.env.REDIS_URL && process.env.NODE_ENV !== "production")
        ) {
          return null; // Stop retrying in tests/dev when Redis is offline
        }
        return Math.min(times * 50, 2000);
      },
    });

if (redisConnection) {
  redisConnection.on("error", () => {
    // Prevents process unhandled error logs in dev/test when Redis is offline
  });
}

export interface WhatsAppJobData {
  recipientPhone: string; // E.164 format: +923001234567
  templateType:
    | "RFQ_SUBMITTED_SUPPLIER_ALERT"
    | "SUPPLIER_QUOTED_BUYER_ALERT"
    | "ORDER_ESCROW_FUNDED"
    | "DISPATCH_TRACKING_ALERT";
  payload: {
    userName: string;
    rfqNumber?: string;
    orderNumber?: string;
    productTitle?: string;
    quantity?: number;
    amount?: number;
    actionUrl?: string;
    carrierName?: string;
    biltiNumber?: string;
  };
}

// On Vercel, BullMQ queue is not created — background workers run on a separate host
export const whatsappQueue =
  isVercel || !redisConnection
    ? null
    : new Queue<WhatsAppJobData>("whatsapp-notifications", {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      });

/**
 * Helper to dispatch WhatsApp job into background queue with fail-safe logging.
 * On Vercel serverless, jobs are skipped (workers run on a separate host).
 */
export async function enqueueWhatsAppNotification(data: WhatsAppJobData) {
  try {
    if (isVercel || process.env.NODE_ENV === "test") {
      console.log(
        `ℹ️ [WhatsApp ${isVercel ? "Serverless" : "Sim Dev"}] To: ${data.recipientPhone} | Template: ${data.templateType}`,
      );
      return;
    }
    await whatsappQueue!.add(data.templateType, data);
    console.log(
      `📨 [WhatsApp Queue] Job enqueued for ${data.recipientPhone} (${data.templateType})`,
    );
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("🔴 Failed to enqueue WhatsApp job:", error);
      throw error;
    }
    console.log(
      `ℹ️ [WhatsApp Sim Dev] To: ${data.recipientPhone} | Template: ${data.templateType}`,
    );
  }
}
