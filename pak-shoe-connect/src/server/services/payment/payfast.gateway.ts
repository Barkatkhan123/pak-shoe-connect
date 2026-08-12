import crypto from "crypto";
import {
  PaymentGateway,
  SupportedPaymentProvider,
  CreatePaymentParams,
  PaymentInitiationResult,
  PaymentVerificationResult,
  RefundResult,
} from "./gateway.interface";
import { requireEnv } from "../../utils/env";

export class PayFastGateway implements PaymentGateway {
  readonly providerName: SupportedPaymentProvider = "PAYFAST";
  // CRIT-01: Fail fast at startup — no silent fallback to default secrets
  private merchantId: string;
  private securedKey: string;

  constructor() {
    this.merchantId = requireEnv("PAYFAST_MERCHANT_ID");
    this.securedKey = requireEnv("PAYFAST_SECURED_KEY");
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentInitiationResult> {
    const txId = `PF-1LINK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 120 * 60 * 1000); // 2 hours for 1Link invoice

    return {
      success: true,
      gatewayTransactionId: txId,
      redirectUrl: `https://ipg.apps.net.pk/ecommerce/api/Transaction/GetTransaction?MERCHANT_ID=${this.merchantId}&TXNAMT=${params.amount}&BASKET_ID=${txId}`,
      paymentToken: `PF-TOKEN-${crypto.randomBytes(12).toString("hex")}`,
      voucherCode: `1LINK-KUICK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      rawResponse: {
        err_code: "00",
        err_msg: "1Link Invoice Created for Corporate B2B Checkout",
        basket_id: txId,
        merchant_id: this.merchantId,
        transaction_amount: params.amount,
      },
      expiresAt,
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    /**
     * MED-03: PRODUCTION INTEGRATION REQUIRED
     *
     * Replace this stub with a real server-to-server call to 1Link/PayFast's
     * Transaction Inquiry API before marking escrow as FUNDED:
     *
     *   POST https://ipg.apps.net.pk/ecommerce/api/Transaction/GetTransactionStatus
     *   Body: { MERCHANT_ID, BASKET_ID, TOKEN: securedKey }
     *
     * After receiving the response, you MUST validate:
     *   1. BASKET_ID === transactionId         (tamper check)
     *   2. TXNAMT === expectedOrderAmount      (short-payment attack prevention)
     *   3. err_code === "00"                   (successful payment code)
     *   4. Transaction date is within 24 hours
     *
     * Never trust the inbound webhook payload amount alone.
     */
    const isMockSuccess = !transactionId.includes("FAIL");

    return {
      verified: isMockSuccess,
      status: isMockSuccess ? "SUCCESS" : "FAILED",
      gatewayTransactionId: transactionId,
      amountPaid: payload?.TXNAMT ? Number(payload.TXNAMT) : 669450,
      currency: "PKR",
      paidAt: new Date(),
      rawResponse: {
        err_code: isMockSuccess ? "00" : "04",
        err_msg: isMockSuccess ? "1Link / PayFast Cleared" : "Declined by issuing bank",
        basket_id: transactionId,
      },
    };
  }

  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
    const refundTxId = `PF-REF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return {
      success: true,
      refundTransactionId: refundTxId,
      amountRefunded: amount || 0,
      rawResponse: {
        err_code: "00",
        err_msg: "Reversal issued through 1Link switch",
        basket_id: transactionId,
        refund_id: refundTxId,
        reason: reason || "Buyer escrow refund",
      },
    };
  }

  verifyWebhookSignature(signature: string, payload: Record<string, any> | string, secret?: string): boolean {
    const key = secret || this.securedKey;
    const bodyStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const expected = crypto.createHmac("sha256", key).update(bodyStr).digest("hex");

    // MED-01: Timing-safe comparison
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex")
      );
    } catch {
      return false;
    }
    // CRIT-02: "valid-pf-test-signature" bypass string has been removed
  }
}
