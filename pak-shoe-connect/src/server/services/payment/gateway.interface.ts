export type SupportedPaymentProvider =
  "EASYPAISA" | "JAZZCASH" | "PAYFAST" | "DIRECT_BANK_TRANSFER" | "STRIPE_INTERNATIONAL";

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customerPhone?: string;
  customerEmail?: string;
  description?: string;
  returnUrl?: string;
  paymentMethodType?:
    "MOBILE_WALLET" | "VOUCHER_OTC" | "DIRECT_DEBIT_1LINK" | "CREDIT_DEBIT_CARD" | "BANK_TRANSFER";
}

export interface PaymentInitiationResult {
  success: boolean;
  gatewayTransactionId: string;
  redirectUrl?: string;
  paymentToken?: string;
  voucherCode?: string;
  rawResponse: Record<string, any>;
  expiresAt: Date;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: "SUCCESS" | "FAILED" | "PENDING";
  gatewayTransactionId: string;
  amountPaid: number;
  currency: string;
  paidAt: Date;
  rawResponse: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundTransactionId: string;
  amountRefunded: number;
  rawResponse: Record<string, any>;
}

export interface PaymentGateway {
  readonly providerName: SupportedPaymentProvider;

  /**
   * Initializes a payment session or voucher with the gateway
   */
  createPayment(params: CreatePaymentParams): Promise<PaymentInitiationResult>;

  /**
   * Verifies an in-flight or completed transaction status with gateway API
   */
  verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult>;

  /**
   * Initiates a full or partial refund
   */
  refundPayment(transactionId: string, amount?: number, reason?: string): Promise<RefundResult>;

  /**
   * Cryptographically verifies inbound webhook signature
   */
  verifyWebhookSignature(
    signature: string,
    payload: Record<string, any> | string,
    secret?: string,
  ): boolean;
}
