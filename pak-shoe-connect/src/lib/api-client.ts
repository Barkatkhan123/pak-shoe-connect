/**
 * Anamon B2B Footwear Marketplace — Unified Frontend API Client
 * Connects UI components seamlessly to the Backend Gateway & Services
 */

import { adminSecurityEngine, MASTER_ADMIN_EMAIL } from "./admin-auth";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return (import.meta.env.VITE_API_URL as string) || "";
  }
  return (typeof process !== "undefined" && (process.env.VITE_API_URL || process.env.SITE_URL)) || "";
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: any;
  timestamp?: string;
}

async function request<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, params, headers = {} } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    }
    const text = await res.text();
    if (!res.ok) {
      return { success: false, error: text || `HTTP ${res.status} ${res.statusText}` };
    }
    return { success: true, data: text as unknown as T };
  } catch (err: any) {
    console.warn(`[ApiClient] Error calling ${endpoint}:`, err.message);
    return {
      success: false,
      error: err.message || "Network request failed",
    };
  }
}

export const apiClient = {
  // 1. Catalog & Search
  catalog: {
    list: (params?: {
      category?: string;
      gender?: string;
      search?: string;
      city?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => request("/api/v1/catalog/products", { params }),

    get: (slugOrId: string) => request(`/api/v1/catalog/products/${slugOrId}`),

    search: (query: string, filters?: any) =>
      request("/api/v1/catalog/search", { params: { q: query, ...filters } }),
  },

  // 2. Wholesale Pricing & Cart Engine
  pricing: {
    calculate: (payload: {
      productId?: string;
      cartonQty: number;
      destinationCity?: string;
      isExpress?: boolean;
    }) => request("/api/v1/pricing/calculate", { method: "POST", body: payload }),

    calculateCart: (payload: {
      items: Array<{ productId?: string; cartonQty: number; pairsCount?: number; unitPrice?: number }>;
      destinationCity?: string;
    }) => request("/api/v1/cart/calculate", { method: "POST", body: payload }),
  },

  // 3. RFQ Negotiation Engine
  rfq: {
    create: (payload: {
      buyerId: string;
      productId: string;
      quantityPairs: number;
      targetPricePerPair?: number;
      customizationDetails?: string;
    }) => request("/api/v1/rfq/create", { method: "POST", body: payload }),

    get: (rfqId: string) => request(`/api/v1/rfq/${rfqId}`),

    listByBuyer: (buyerId: string) => request(`/api/v1/rfq/buyer/${buyerId}`),
  },

  // 4. Logistics & Bilti Tracking Engine
  logistics: {
    calculateShipping: (payload: {
      originCity: string;
      destinationCity: string;
      cartonsCount: number;
      isExpress?: boolean;
    }) => request("/api/v1/logistics/calculate-shipping", { method: "POST", body: payload }),

    trackBilti: (biltiNumber: string) =>
      request(`/api/v1/logistics/track-bilti/${biltiNumber}`),

    listHubs: () => request("/api/v1/logistics/hubs"),
  },

  tracking: {
    get: (orderNumber: string) => request(`/api/v1/orders/tracking/${orderNumber}`),
  },

  // 5. Escrow Protection Services
  escrow: {
    getAccountSummary: (userId: string) =>
      request(`/api/v1/escrow/summary/${userId}`),

    createProtection: (payload: {
      orderId: string;
      amount: number;
      inspectionTier?: "STANDARD" | "PREMIUM" | "NONE";
    }) => request("/api/v1/escrow/create", { method: "POST", body: payload }),

    releaseFunds: (escrowId: string) =>
      request(`/api/v1/escrow/release/${escrowId}`, { method: "POST" }),
  },

  // 6. Payments Engine
  payments: {
    // BUG-21 FIX: Removed the untyped `createIntent` duplicate \u2014 it called the
    // same endpoint as `createPaymentIntent` with a loose `any` payload type.
    createPaymentIntent: (payload: {
      orderId: string;
      amount: number;
      paymentMethod: "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA" | "ESCROW_GATEWAY";
      customerDetails: {
        name: string;
        email: string;
        phone: string;
      };
    }) => request("/api/v1/payments/create-intent", { method: "POST", body: payload }),

    getStatus: (intentId: string) => request(`/api/v1/payments/intent/${intentId}`),

    submitBankSlip: (payload: { intentId: string; slipUrl: string; notes?: string }) =>
      request("/api/v1/payments/bank-transfer/confirm-slip", { method: "POST", body: payload }),

    processWebhook: (gateway: string, payload: any, headers?: Record<string, string>) =>
      request(`/api/v1/payments/webhook/${gateway}`, {
        method: "POST",
        body: payload,
        headers,
      }),
  },

  // 7. Supplier Factory Portal
  supplier: {
    getDashboard: (supplierId: string) =>
      request(`/api/v1/supplier/dashboard/${supplierId}`),

    getAnalytics: (supplierId: string) =>
      request(`/api/v1/supplier/analytics/${supplierId}`),

    submitQuote: (payload: {
      rfqId: string;
      supplierId: string;
      unitPrice: number;
      leadTimeDays: number;
      validityDays?: number;
      notes?: string;
    }) => request("/api/v1/supplier/quotes", { method: "POST", body: payload }),

    getWallet: (supplierId: string) =>
      request(`/api/v1/supplier/wallet/${supplierId}`),

    requestSettlement: (payload: {
      supplierId: string;
      amount: number;
      iban: string;
      bankName: string;
    }) => request("/api/v1/supplier/settlements/request", { method: "POST", body: payload }),
  },

  // 8. Invoicing & Financial Operations
  invoices: {
    generate: (orderNumber: string) =>
      request(`/api/v1/invoices/order/${orderNumber}`),
  },

  // 9. Master Admin Production Authorization API
  admin: {
    getFinancialAnalytics: () => request("/api/v1/finance/analytics/overview"),
    getReconciliationReport: () => request("/api/v1/finance/reconciliation/report"),

    verifyAuthorization: async () => {
      const session = adminSecurityEngine.getStoredSession();
      if (!session || session.email !== MASTER_ADMIN_EMAIL || !session.is2faVerified) {
        return { success: false, error: "HTTP 403 Forbidden: Master Admin Authorization Required" };
      }
      const dbCheck = await adminSecurityEngine.verifyServerAuthorization(session.email);
      if (!dbCheck.authorized) {
        return { success: false, error: dbCheck.reason || "Forbidden" };
      }
      return { success: true, data: session };
    },

    performProductAction: async (action: "CREATE" | "UPDATE" | "DELETE", productData: any) => {
      const session = adminSecurityEngine.getStoredSession();
      if (!session || session.email !== MASTER_ADMIN_EMAIL || !session.is2faVerified) {
        adminSecurityEngine.logActivity({
          adminEmail: session?.email || "UNAUTHENTICATED",
          role: "USER",
          action: `UNAUTHORIZED_PRODUCT_${action}`,
          target: productData?.name || productData?.slug || "Product",
          ipAddress: session?.ipAddress || "Unknown",
          status: "DENIED",
          details: "Attempted product modification without MASTER_ADMIN authorization.",
        });
        return { success: false, error: "HTTP 403 Forbidden: Only anamoontotrade@gmail.com can manage catalog items." };
      }

      adminSecurityEngine.logActivity({
        adminEmail: session.email,
        role: session.role,
        action: `PRODUCT_${action}`,
        target: productData?.name || productData?.slug || "Product",
        ipAddress: session.ipAddress,
        status: "SUCCESS",
        details: `Product ${action.toLowerCase()}d by Master Admin.`,
      });

      return { success: true, data: productData };
    },

    getAuditLogs: () => {
      const session = adminSecurityEngine.getStoredSession();
      if (!session || session.email !== MASTER_ADMIN_EMAIL) {
        return { success: false, error: "HTTP 403 Forbidden: Unauthorized access to Audit Trail" };
      }
      return { success: true, data: adminSecurityEngine.getAuditLogs() };
    },
  },
};
