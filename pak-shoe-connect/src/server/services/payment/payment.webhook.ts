import crypto from "crypto";
import { PaymentProvider } from "@prisma/client";
import { SupportedPaymentProvider } from "./gateway.interface";
import { PaymentGatewayFactory } from "./payment.gateway.factory";
import { IdempotencyService, IdempotencyConflictError } from "./idempotency.service";
import { OrderService } from "../order.service";
import { prisma } from "../../db";
import { isUuid } from "../../utils/isUuid";
import { SecurityLogger } from "./security-logger";

/** Maximum age of a webhook in seconds before it is rejected as a replay */
const WEBHOOK_MAX_AGE_SECONDS = 300;

export interface ProcessWebhookInput {
  provider: SupportedPaymentProvider | string;
  signature?: string;
  timestamp?: number;
  payload: Record<string, any>;
  rawBody?: string;
}

export class PaymentWebhookHandler {
  static async handleWebhook(input: ProcessWebhookInput) {
    const provider = input.provider.toUpperCase().replace(/-/g, "_") as SupportedPaymentProvider;
    const gateway = PaymentGatewayFactory.getGateway(provider);
    const correlationId = `WH-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    SecurityLogger.info(correlationId, "WEBHOOK_RECEIVED", {
      provider,
      hasSignature: !!input.signature,
      hasTimestamp: !!input.timestamp,
    });

    const requiresSignature = provider !== "DIRECT_BANK_TRANSFER";
    if (requiresSignature && !input.signature) {
      SecurityLogger.warn(correlationId, "WEBHOOK_REJECTED_NO_SIGNATURE", { provider });
      return {
        success: false,
        status: 401,
        message: "Webhook signature header is required and was not provided",
        correlationId,
      };
    }

    if (input.timestamp !== undefined) {
      const ageSeconds = Math.floor(Date.now() / 1000) - input.timestamp;
      if (ageSeconds < 0 || ageSeconds > WEBHOOK_MAX_AGE_SECONDS) {
        SecurityLogger.warn(correlationId, "WEBHOOK_REJECTED_REPLAY", {
          provider,
          ageSeconds,
          maxAgeSeconds: WEBHOOK_MAX_AGE_SECONDS,
        });
        return {
          success: false,
          status: 401,
          message: `Webhook timestamp out of acceptable window (age: ${ageSeconds}s, max: ${WEBHOOK_MAX_AGE_SECONDS}s)`,
          correlationId,
        };
      }
    }

    if (input.signature) {
      const isValid = gateway.verifyWebhookSignature(
        input.signature,
        input.rawBody || input.payload,
      );
      if (!isValid) {
        SecurityLogger.warn(correlationId, "WEBHOOK_REJECTED_INVALID_SIGNATURE", { provider });
        return {
          success: false,
          status: 401,
          message: "Invalid webhook HMAC signature — request rejected",
          correlationId,
        };
      }
      SecurityLogger.info(correlationId, "WEBHOOK_SIGNATURE_VERIFIED", { provider });
    }

    const transactionId =
      input.payload.transactionId ||
      input.payload.pp_TxnRefNo ||
      input.payload.basket_id ||
      input.payload.referenceCode;

    const orderRef =
      input.payload.orderId ||
      input.payload.pp_BillReference ||
      input.payload.orderNumber;

    if (!transactionId) {
      SecurityLogger.warn(correlationId, "WEBHOOK_REJECTED_MISSING_TXID", { provider });
      return {
        success: false,
        status: 400,
        message: "Missing transaction identifier in payload",
        correlationId,
      };
    }

    const idempotencyKey = `WEBHOOK-${provider}-${transactionId}`;

    const completed = await IdempotencyService.check(idempotencyKey);
    if (completed.isDuplicate) {
      SecurityLogger.info(correlationId, "WEBHOOK_DUPLICATE_IGNORED", { provider, transactionId });
      return {
        success: true,
        status: 200,
        message: "Duplicate callback ignored (Idempotent)",
        cached: true,
        data: completed.cachedResponse,
        correlationId,
      };
    }

    const lock = await IdempotencyService.acquireLock(idempotencyKey, input.payload);
    if (!lock.acquired) {
      if (lock.cachedResponse) {
        return {
          success: true,
          status: 200,
          message: "Duplicate callback ignored (Idempotent)",
          cached: true,
          data: lock.cachedResponse,
          correlationId,
        };
      }

      SecurityLogger.warn(correlationId, "WEBHOOK_CONCURRENT_DUPLICATE", { provider, transactionId });
      return {
        success: false,
        status: 409,
        message: "Webhook already being processed",
        correlationId,
      };
    }

    const verification = await gateway.verifyPayment(transactionId, input.payload);

    SecurityLogger.info(correlationId, "WEBHOOK_PAYMENT_VERIFIED", {
      provider,
      transactionId,
      status: verification.status,
      verified: verification.verified,
    });

    if (verification.verified && verification.status === "SUCCESS" && orderRef) {
      try {
        if (process.env.DATABASE_URL) {
          const order = await prisma.order.findFirst({
            where: {
              OR: isUuid(orderRef)
                ? [{ id: orderRef }, { orderNumber: orderRef }]
                : [{ orderNumber: orderRef }],
            },
          });

          if (order) {
            const amount = Number(input.payload.amount ?? order.totalAmount);
            await OrderService.confirmPaymentAndFundEscrow({
              orderId: order.id,
              paymentTxId: transactionId,
              amount,
              provider: provider as PaymentProvider,
            });
            SecurityLogger.info(correlationId, "ESCROW_FUNDED", {
              provider,
              transactionId,
              orderId: order.id,
            });
          }
        }
      } catch (err) {
        SecurityLogger.warn(correlationId, "WEBHOOK_DB_SKIP", {
          reason: "Database unavailable or unconfigured",
        });
      }
    } else if (!verification.verified) {
      SecurityLogger.warn(correlationId, "WEBHOOK_PAYMENT_UNVERIFIED", {
        provider,
        transactionId,
        gatewayStatus: verification.status,
      });
    }

    const result = {
      success: true,
      status: 200,
      verified: verification.verified,
      gatewayStatus: verification.status,
      transactionId,
      orderId: orderRef,
      correlationId,
    };

    await IdempotencyService.complete(idempotencyKey, result);
    return result;
  }
}
