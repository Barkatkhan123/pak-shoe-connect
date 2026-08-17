import crypto from "crypto";
import { SupportedPaymentProvider } from "./gateway.interface";
import { PaymentGatewayFactory } from "./payment.gateway.factory";
import { PaymentIntentService, PaymentIntent } from "./payment-intent.service";
import { EscrowService } from "./escrow.service";
import { IdempotencyService, IdempotencyConflictError } from "./idempotency.service";

export interface CreatePaymentSessionInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  provider: SupportedPaymentProvider | string;
  customerPhone?: string;
  customerEmail?: string;
  idempotencyKey?: string;
  supplierId?: string;
  supplierTier?: "FREE_STARTER" | "SILVER_MANUFACTURER" | "GOLD_FACTORY";
}

export class PaymentService {
  /**
   * Initializes a payment intent and locks pre-escrow reservation
   */
  static async initiatePayment(input: CreatePaymentSessionInput) {
    const key = input.idempotencyKey || `INIT-${input.orderId}-${input.provider}`;

    // 1. Idempotency Check
    const idemp = await IdempotencyService.check(key);
    if (idemp.isDuplicate) {
      return idemp.cachedResponse;
    }

    const lock = await IdempotencyService.acquireLock(key, input);
    if (!lock.acquired) {
      if (lock.cachedResponse) return lock.cachedResponse;
      throw new IdempotencyConflictError("Payment initiation already in progress");
    }

    // 2. Create Payment Intent
    const intent = await PaymentIntentService.createIntent({
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      amount: input.amount,
      provider: input.provider,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
    });

    // 3. Initialize Escrow Account in CREATED state
    if (input.supplierId) {
      await EscrowService.createEscrow({
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        amount: input.amount,
        supplierId: input.supplierId,
        supplierTier: input.supplierTier || "GOLD_FACTORY",
      });
      await EscrowService.transitionState(input.orderId, "PAYMENT_PENDING");
    }

    const response = {
      success: true,
      intentId: intent.id,
      orderNumber: input.orderNumber,
      amount: input.amount,
      currency: intent.currency,
      provider: intent.provider,
      gatewayTransactionId: intent.gatewayTransactionId,
      redirectUrl: intent.redirectUrl,
      voucherCode: intent.voucherCode,
      clientSecret: intent.clientSecret,
      expiresAt: intent.expiresAt,
    };

    await IdempotencyService.complete(key, response);
    return response;
  }

  /**
   * Verifies and finalizes an in-flight payment
   */
  static async verifyAndCapture(params: {
    provider: SupportedPaymentProvider | string;
    transactionId: string;
    orderId: string;
    payload?: any;
  }) {
    const gateway = PaymentGatewayFactory.getGateway(params.provider);
    const verification = await gateway.verifyPayment(params.transactionId, params.payload);

    if (verification.verified && verification.status === "SUCCESS") {
      // Transition Escrow to FUNDED
      const existingEscrow = await EscrowService.getEscrow(params.orderId);
      if (existingEscrow && existingEscrow.status === "PAYMENT_PENDING") {
        await EscrowService.transitionState(params.orderId, "FUNDED", {
          reference: `GATEWAY_TX_${params.transactionId}`,
        });
      }
    }

    return verification;
  }

  /**
   * Processes full or partial refund
   */
  static async processRefund(params: {
    provider: SupportedPaymentProvider | string;
    transactionId: string;
    orderId: string;
    amount?: number;
    reason?: string;
  }) {
    const gateway = PaymentGatewayFactory.getGateway(params.provider);
    const refundResult = await gateway.refundPayment(
      params.transactionId,
      params.amount,
      params.reason,
    );

    if (refundResult.success) {
      const existingEscrow = await EscrowService.getEscrow(params.orderId);
      if (existingEscrow) {
        await EscrowService.transitionState(params.orderId, "REFUNDED", {
          reference: `REFUND_TX_${refundResult.refundTransactionId}`,
        });
      }
    }

    return refundResult;
  }
}
