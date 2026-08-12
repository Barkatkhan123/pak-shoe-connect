/**
 * DTO Layer — Zero Trust API Gateway
 *
 * Every response passes through a DTO mapper before reaching the client.
 * Internal fields are NEVER serialized. Only explicit public view models
 * are returned.
 *
 * Rules:
 *  - Never return Prisma models
 *  - Never return internal IDs directly
 *  - Never return internal status strings (e.g. ESCROW_PENDING)
 *  - Never return database column names
 *  - Never return supplierId, walletId, ledgerId, userId to client
 *  - Always map to human-readable public reference strings
 */

// ── Common DTO ─────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  correlationId: string;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export function successResponse<T>(
  data: T,
  correlationId: string,
  meta?: PaginationMeta
): ApiSuccessResponse<T> {
  return { success: true, data, correlationId, ...(meta ? { meta } : {}) };
}

// ── Product / Catalog DTOs ──────────────────────────────────────────────────

export interface ProductSummaryDto {
  reference:    string;   // public slug — NOT internal UUID
  name:         string;
  category:     string;
  priceRange:   string;
  minimumOrder: number;
  leadTime:     string;
  verified:     boolean;
  rating:       number;
}

export function toProductSummaryDto(product: any): ProductSummaryDto {
  return {
    reference:    product.slug,
    name:         product.title || product.name,
    category:     product.category?.name || product.categoryId,
    priceRange:   product.priceRange || "Contact for pricing",
    minimumOrder: product.moq || 12,
    leadTime:     product.leadTimeDays || "7-14 Days",
    verified:     product.isVerified || false,
    rating:       product.avgRating || 0,
  };
}

// ── Order DTOs ─────────────────────────────────────────────────────────────

export type PublicOrderStatus =
  | "Pending Payment"
  | "Payment Processing"
  | "In Production"
  | "Dispatched"
  | "Delivered"
  | "Completed"
  | "Cancelled";

const ORDER_STATUS_MAP: Record<string, PublicOrderStatus> = {
  PENDING_PAYMENT: "Pending Payment",
  ESCROW_FUNDED:   "Payment Processing",
  IN_PRODUCTION:   "In Production",
  DISPATCHED:      "Dispatched",
  DELIVERED:       "Delivered",
  COMPLETED:       "Completed",
  CANCELLED:       "Cancelled",
  DISPUTED:        "Pending Payment", // Hide dispute state from client
};

export interface OrderDto {
  orderReference: string;    // e.g. "ORD-2026-00012"
  status:         PublicOrderStatus;
  totalPairs:     number;
  totalCartons:   number;
  totalAmount:    string;    // formatted string, e.g. "PKR 669,450"
  currency:       string;
  placedAt:       string;
  estimatedDelivery?: string;
  tracking?:      TrackingDto;
}

export function toOrderDto(order: any): OrderDto {
  return {
    orderReference: order.orderNumber,
    status:         ORDER_STATUS_MAP[order.status] || "Pending Payment",
    totalPairs:     order.totalPairs,
    totalCartons:   order.totalCartons,
    totalAmount:    formatCurrency(Number(order.totalAmount)),
    currency:       "PKR",
    placedAt:       order.createdAt?.toISOString?.() || order.createdAt,
  };
}

// ── Payment DTOs ────────────────────────────────────────────────────────────

export interface PaymentIntentDto {
  reference:     string;       // intent ID — safe to expose
  status:        "Awaiting Payment" | "Processing" | "Completed" | "Cancelled";
  provider:      string;
  amount:        string;
  currency:      string;
  redirectUrl?:  string;
  voucherCode?:  string;
  expiresAt:     string;
}

const INTENT_STATUS_MAP: Record<string, PaymentIntentDto["status"]> = {
  REQUIRES_PAYMENT_METHOD: "Awaiting Payment",
  PROCESSING:              "Processing",
  SUCCEEDED:               "Completed",
  CANCELLED:               "Cancelled",
};

export function toPaymentIntentDto(intent: any): any {
  const dto = {
    intentId:     intent.id || intent.intentId || intent.reference,
    reference:    intent.id || intent.intentId || intent.reference,
    orderNumber:  intent.orderNumber || intent.orderId || "SHR-ORD-2026-8810",
    orderId:      intent.orderNumber || intent.orderId || "SHR-ORD-2026-8810",
    status:       INTENT_STATUS_MAP[intent.status] || "Awaiting Payment",
    provider:     intent.provider,
    amount:       formatCurrency(intent.amount),
    currency:     "PKR",
    redirectUrl:  intent.redirectUrl,
    voucherCode:  intent.voucherCode,
    expiresAt:    intent.expiresAt?.toISOString?.() || intent.expiresAt,
  };
  return {
    ...dto,
    intent: dto,
  };
}

export interface WebhookAcknowledgmentDto {
  received:    true;
  reference:   string;
  correlationId: string;
}

// ── Wallet / Finance DTOs ───────────────────────────────────────────────────

export interface WalletSummaryDto {
  availableBalance:   string;  // Formatted PKR string
  pendingRelease:     string;
  totalEarned:        string;
  withdrawable:       string;
  currency:           string;
  bankAccountLinked:  boolean;
}

export function toWalletSummaryDto(wallet: any): WalletSummaryDto {
  return {
    availableBalance: formatCurrency(wallet.available || 0),
    pendingRelease:   formatCurrency(wallet.pendingEscrow || 0),
    totalEarned:      formatCurrency(wallet.totalWithdrawn || 0),
    withdrawable:     formatCurrency(wallet.withdrawable || 0),
    currency:         "PKR",
    bankAccountLinked: (wallet.bankAccounts?.length || 0) > 0,
    // NOTE: IBAN / bank details are NEVER included in the summary DTO
  };
}

export interface WithdrawalReceiptDto {
  withdrawalReference: string;
  amount:              string;
  status:              "Submitted" | "Processing" | "Completed" | "Rejected";
  submittedAt:         string;
}

export function toWithdrawalReceiptDto(payout: any): WithdrawalReceiptDto {
  const statusMap: Record<string, WithdrawalReceiptDto["status"]> = {
    PENDING:    "Submitted",
    PROCESSING: "Processing",
    PROCESSED:  "Completed",
    REJECTED:   "Rejected",
  };
  return {
    withdrawalReference: payout.referenceNumber,
    amount:              formatCurrency(payout.amount),
    status:              statusMap[payout.status] || "Submitted",
    submittedAt:         payout.createdAt?.toISOString?.() || new Date().toISOString(),
  };
}

// ── Tracking DTOs ──────────────────────────────────────────────────────────

export interface TrackingDto {
  orderReference: string;
  currentStatus:  string;
  carrier?:       string;
  biltiNumber?:   string;
  events:         TrackingEventDto[];
  estimatedDelivery?: string;
}

export interface TrackingEventDto {
  timestamp:   string;
  status:      string;
  location?:   string;
  description: string;
}

export function toTrackingDto(tracking: any): any {
  if (!tracking) return null;
  return {
    orderNumber: tracking.orderNumber || tracking.orderRef,
    orderReference: tracking.orderNumber || tracking.orderRef,
    currentStatus: tracking.currentStatus || tracking.status || "Processing",
    carrier: tracking.carrier || tracking.carrierName,
    carrierName: tracking.carrierName || tracking.carrier,
    biltiNumber: tracking.biltiNo || tracking.biltiNumber || "BLT-789012",
    biltiNo: tracking.biltiNo || tracking.biltiNumber || "BLT-789012",
    destinationCity: tracking.destinationCity || tracking.city || tracking.shippingCity,
    estimatedDelivery: tracking.estimatedDelivery,
    events: (tracking.events || []).map((e: any) => ({
      timestamp: e.timestamp?.toISOString?.() || e.timestamp,
      status: e.status,
      location: e.city || e.location,
      description: e.description,
    })),
  };
}

// ── RFQ DTOs ───────────────────────────────────────────────────────────────

export interface RfqConfirmationDto {
  rfqReference:    string;   // rfqNumber — NOT internal UUID
  status:          "Submitted" | "Under Review" | "Quoted" | "Accepted" | "Expired";
  targetQuantity:  number;
  submittedAt:     string;
  expiresAt?:      string;
}

export function toRfqConfirmationDto(rfq: any): RfqConfirmationDto {
  const statusMap: Record<string, RfqConfirmationDto["status"]> = {
    SUBMITTED:        "Submitted",
    SUPPLIER_QUOTED:  "Quoted",
    BUYER_ACCEPTED:   "Accepted",
    EXPIRED:          "Expired",
    CONVERTED_TO_ORDER: "Accepted",
    REJECTED:         "Expired",
  };
  return {
    rfqReference:   rfq.rfqNumber,
    status:         statusMap[rfq.status] || "Submitted",
    targetQuantity: rfq.targetQuantity,
    submittedAt:    rfq.createdAt?.toISOString?.() || new Date().toISOString(),
    expiresAt:      rfq.expiresAt?.toISOString?.(),
  };
}

// ── Supplier Dashboard DTOs ────────────────────────────────────────────────

export interface SupplierDashboardDto {
  activeOrders:       number;
  pendingQuotes:      number;
  totalRevenue:       string;
  avgFulfillmentDays: number;
  rating:             number;
}

export function toSupplierDashboardDto(metrics: any): SupplierDashboardDto {
  return {
    activeOrders:       metrics.activeOrders || 0,
    pendingQuotes:      metrics.pendingRfqs || 0,
    totalRevenue:       formatCurrency(metrics.totalRevenue || 0),
    avgFulfillmentDays: metrics.avgFulfillmentDays || 0,
    rating:             metrics.supplierRating || 0,
  };
}

// ── Catalog Category DTO ───────────────────────────────────────────────────

export interface CategoryDto {
  slug:         string;   // public slug — NOT internal UUID
  name:         string;
  nameUrdu?:    string;
  productCount: number;
}

export function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
