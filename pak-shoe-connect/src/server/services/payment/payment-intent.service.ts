import crypto from "crypto";
import { PaymentStatus, PaymentProvider } from "@prisma/client";
import { prisma } from "../../db";
import { isUuid } from "../../utils/isUuid";
import { SupportedPaymentProvider } from "./gateway.interface";
import { PaymentGatewayFactory } from "./payment.gateway.factory";

export interface PaymentIntent {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  provider: SupportedPaymentProvider;
  status: "REQUIRES_PAYMENT_METHOD" | "PROCESSING" | "SUCCEEDED" | "CANCELLED";
  clientSecret: string;
  gatewayTransactionId?: string;
  redirectUrl?: string;
  voucherCode?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentIntentService {
  private static _testStore: Map<string, PaymentIntent> = new Map();

  private static useDatabase(orderId: string): boolean {
    return isUuid(orderId);
  }

  private static mapDbStatus(status: PaymentStatus): PaymentIntent["status"] {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return "SUCCEEDED";
      case PaymentStatus.FAILED:
        return "CANCELLED";
      default:
        return "PROCESSING";
    }
  }

  private static mapIntentFromDb(
    row: {
      id: string;
      orderId: string;
      provider: SupportedPaymentProvider;
      providerTxId: string | null;
      amount: { toNumber?: () => number } | number;
      currency: string;
      status: PaymentStatus;
      rawResponse: unknown;
      createdAt: Date;
      updatedAt: Date;
    },
    orderNumber: string,
  ): PaymentIntent {
    const raw = (row.rawResponse || {}) as Record<string, unknown>;
    return {
      id: row.id,
      orderId: row.orderId,
      orderNumber,
      amount: Number(row.amount),
      currency: row.currency,
      provider: row.provider as SupportedPaymentProvider,
      status: this.mapDbStatus(row.status),
      clientSecret: String(raw.clientSecret || ""),
      gatewayTransactionId: row.providerTxId || undefined,
      redirectUrl: raw.redirectUrl as string | undefined,
      voucherCode: raw.voucherCode as string | undefined,
      expiresAt: raw.expiresAt ? new Date(String(raw.expiresAt)) : new Date(Date.now() + 3_600_000),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  static async createIntent(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
    currency?: string;
    provider: SupportedPaymentProvider | string;
    customerPhone?: string;
    customerEmail?: string;
  }): Promise<PaymentIntent> {
    const provider = params.provider.toUpperCase().replace(/-/g, "_") as SupportedPaymentProvider;
    const clientSecret = `pi_sec_${crypto.randomBytes(16).toString("hex")}`;

    const gateway = PaymentGatewayFactory.getGateway(provider);
    const session = await gateway.createPayment({
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      amount: params.amount,
      currency: params.currency || "PKR",
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
    });

    if (!this.useDatabase(params.orderId)) {
      const intentId = `PI-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      const intent: PaymentIntent = {
        id: intentId,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        amount: params.amount,
        currency: params.currency || "PKR",
        provider,
        status: "PROCESSING",
        clientSecret,
        gatewayTransactionId: session.gatewayTransactionId,
        redirectUrl: session.redirectUrl,
        voucherCode: session.voucherCode,
        expiresAt: session.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this._testStore.set(intentId, intent);
      return intent;
    }

    const row = await prisma.paymentTransaction.create({
      data: {
        orderId: params.orderId,
        provider: (provider === "PAYFAST" ? "ONE_LINK_PAYFAST" : provider) as PaymentProvider,
        providerTxId: session.gatewayTransactionId,
        amount: params.amount,
        currency: params.currency || "PKR",
        status: PaymentStatus.INITIATED,
        rawResponse: {
          clientSecret,
          redirectUrl: session.redirectUrl,
          voucherCode: session.voucherCode,
          expiresAt: session.expiresAt.toISOString(),
          orderNumber: params.orderNumber,
        },
      },
    });

    return this.mapIntentFromDb(row as any, params.orderNumber);
  }

  static async getIntent(intentId: string): Promise<PaymentIntent | null> {
    if (this._testStore.has(intentId)) {
      return this._testStore.get(intentId) || null;
    }

    if (!isUuid(intentId)) {
      return null;
    }

    const row = await prisma.paymentTransaction.findUnique({
      where: { id: intentId },
      include: { order: { select: { orderNumber: true } } },
    });
    if (!row) return null;

    const raw = (row.rawResponse || {}) as Record<string, unknown>;
    const orderNumber = String(raw.orderNumber || row.order.orderNumber);
    return this.mapIntentFromDb(row as any, orderNumber);
  }

  static async updateStatus(
    intentId: string,
    status: PaymentIntent["status"],
  ): Promise<PaymentIntent> {
    if (this._testStore.has(intentId)) {
      const intent = this._testStore.get(intentId);
      if (!intent) {
        throw new Error(`PaymentIntent ${intentId} not found`);
      }
      intent.status = status;
      intent.updatedAt = new Date();
      this._testStore.set(intentId, intent);
      return intent;
    }

    const dbStatus =
      status === "SUCCEEDED"
        ? PaymentStatus.SUCCESS
        : status === "CANCELLED"
          ? PaymentStatus.FAILED
          : PaymentStatus.INITIATED;

    const row = await prisma.paymentTransaction.update({
      where: { id: intentId },
      data: { status: dbStatus },
      include: { order: { select: { orderNumber: true } } },
    });

    const raw = (row.rawResponse || {}) as Record<string, unknown>;
    const orderNumber = String(raw.orderNumber || row.order.orderNumber);
    return this.mapIntentFromDb(row as any, orderNumber);
  }

  static clear(): void {
    this._testStore.clear();
  }
}
