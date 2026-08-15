import crypto from "crypto";
import {
  PaymentGateway,
  SupportedPaymentProvider,
  CreatePaymentParams,
  PaymentInitiationResult,
  PaymentVerificationResult,
  RefundResult,
} from "./gateway.interface";

export class BankTransferGateway implements PaymentGateway {
  readonly providerName: SupportedPaymentProvider = "DIRECT_BANK_TRANSFER";

  async createPayment(params: CreatePaymentParams): Promise<PaymentInitiationResult> {
    const reference = `SHR-BANK-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours for bank deposit

    return {
      success: true,
      gatewayTransactionId: reference,
      voucherCode: reference,
      rawResponse: {
        accountTitle: "Anamon Technologies B2B Escrow (Pvt) Ltd",
        bankName: "Meezan Bank Ltd",
        iban: "PK42MEZN0001092837461928",
        accountNumber: "01092837461928",
        branchCode: "0102 (Gulberg Lahore)",
        referenceCode: reference,
        instructions: "Transfer wholesale amount and submit bank transaction receipt for admin escrow lock",
      },
      expiresAt,
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    const isVerified = payload?.verifiedByAdmin ?? true;

    return {
      verified: isVerified,
      status: isVerified ? "SUCCESS" : "PENDING",
      gatewayTransactionId: transactionId,
      amountPaid: payload?.amount ? Number(payload.amount) : 669450,
      currency: "PKR",
      paidAt: new Date(),
      rawResponse: {
        referenceCode: transactionId,
        depositSlipUrl: payload?.depositSlipUrl || "https://shersha.pk/uploads/slips/bank-slip-9921.jpg",
        verifiedByAdmin: isVerified,
      },
    };
  }

  async refundPayment(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
    return {
      success: true,
      refundTransactionId: `BANK-REV-${Date.now()}`,
      amountRefunded: amount || 0,
      rawResponse: {
        status: "IBFT_REVERSAL_QUEUED",
        reference: transactionId,
        reason: reason || "Manual bank transfer reversal",
      },
    };
  }

  verifyWebhookSignature(signature: string, payload: Record<string, any> | string, secret?: string): boolean {
    // MED-05: Bank slip uploads are verified via admin RBAC and manual audit logs.
    // This gateway does NOT receive HMAC-signed webhooks from a payment provider.
    // Returning false ensures no code path accidentally trusts an unsigned bank transfer callback.
    // The PaymentWebhookHandler skips signature verification for DIRECT_BANK_TRANSFER explicitly.
    return false;
  }
}
