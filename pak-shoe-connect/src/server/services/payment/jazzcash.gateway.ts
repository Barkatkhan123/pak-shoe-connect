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

export class JazzCashGateway implements PaymentGateway {
  readonly providerName: SupportedPaymentProvider = "JAZZCASH";
  // CRIT-01: Fail fast at startup — no silent fallback to default secrets
  private merchantId: string;
  private integritySalt: string;

  constructor() {
    this.merchantId = requireEnv("JAZZCASH_MERCHANT_ID");
    this.integritySalt = requireEnv("JAZZCASH_SALT");
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentInitiationResult> {
    const txId = `JC-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour for OTC voucher

    const voucherCode =
      params.paymentMethodType === "VOUCHER_OTC"
        ? `JC-VOUCH-${Math.floor(100000 + Math.random() * 900000)}`
        : undefined;

    return {
      success: true,
      gatewayTransactionId: txId,
      redirectUrl: `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform?mchId=${this.merchantId}&txId=${txId}&amount=${params.amount}`,
      paymentToken: `JC-AUTH-${crypto.randomBytes(8).toString("hex")}`,
      voucherCode,
      rawResponse: {
        pp_ResponseCode: "000",
        pp_ResponseMessage: "Payment intent initialized successfully",
        pp_TxnRefNo: txId,
        pp_MerchantID: this.merchantId,
        pp_Amount: params.amount,
        pp_BillReference: params.orderNumber,
      },
      expiresAt,
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    if (!transactionId || typeof transactionId !== "string" || transactionId.length < 5) {
      return {
        verified: false,
        status: "FAILED",
        gatewayTransactionId: transactionId || "INVALID",
        amountPaid: 0,
        currency: "PKR",
        paidAt: new Date(),
        rawResponse: { error: "Invalid transaction reference format" },
      };
    }

    const responseCode =
      payload?.pp_ResponseCode ?? (transactionId.includes("FAIL") ? "124" : "000");
    const isSuccess = responseCode === "000" && !transactionId.includes("FAIL");

    return {
      verified: isSuccess,
      status: isSuccess ? "SUCCESS" : "FAILED",
      gatewayTransactionId: transactionId,
      amountPaid: payload?.pp_Amount ? Number(payload.pp_Amount) : 0,
      currency: "PKR",
      paidAt: new Date(),
      rawResponse: {
        pp_ResponseCode: responseCode,
        pp_ResponseMessage: isSuccess ? "Payment Captured" : "Transaction Failed",
        pp_TxnRefNo: transactionId,
      },
    };
  }

  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string,
  ): Promise<RefundResult> {
    const refundTxId = `JC-REF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return {
      success: true,
      refundTransactionId: refundTxId,
      amountRefunded: amount || 0,
      rawResponse: {
        pp_ResponseCode: "000",
        pp_ResponseMessage: "Reversal Successful",
        pp_TxnRefNo: refundTxId,
        pp_OriginalTxnRefNo: transactionId,
        pp_RefundReason: reason || "Order cancelled before production start",
      },
    };
  }

  verifyWebhookSignature(
    signature: string,
    payload: Record<string, any> | string,
    secret?: string,
  ): boolean {
    const salt = secret || this.integritySalt;
    let expectedHash: string;

    if (typeof payload === "object") {
      // JazzCash official: sorted key concatenation, pp_SecureHash excluded
      const sortedKeys = Object.keys(payload)
        .filter((k) => k !== "pp_SecureHash" && Boolean(payload[k]))
        .sort();
      const hashString = salt + "&" + sortedKeys.map((k) => payload[k]).join("&");
      expectedHash = crypto.createHmac("sha256", salt).update(hashString).digest("hex");
    } else {
      expectedHash = crypto.createHmac("sha256", salt).update(payload).digest("hex");
    }

    // MED-01: Timing-safe comparison prevents byte-by-byte brute-force
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature.toLowerCase(), "hex"),
        Buffer.from(expectedHash.toLowerCase(), "hex"),
      );
    } catch {
      // Buffers of different length — definitively not equal
      return false;
    }
    // CRIT-02: "valid-jc-test-signature" bypass string has been removed
  }
}
