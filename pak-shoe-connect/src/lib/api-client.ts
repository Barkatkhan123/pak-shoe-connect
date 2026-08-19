/**
 * Anamon B2B Footwear Marketplace — Unified Frontend API Client
 * Connects UI components seamlessly to the Backend Gateway & Services
 */

import { adminSecurityEngine, MASTER_ADMIN_EMAIL } from "./admin-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  getStoredProducts,
  getProduct,
  getCategoriesWithCounts,
  addStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  Product,
} from "@/data/products";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const envUrl =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      (import.meta.env.VITE_API_URL as string);
    if (envUrl) return envUrl;

    // When deployed on Hostinger static domain, route API calls to the live Vercel backend
    if (
      window.location.hostname.includes("anamonofficial") ||
      window.location.hostname.includes("hostingersite")
    ) {
      return "https://pak-shoe-connect.vercel.app";
    }
    return "";
  }
  return (
    (typeof process !== "undefined" && (process.env?.VITE_API_URL || process.env?.SITE_URL)) || ""
  );
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | { code?: string; message?: string; correlationId?: string };
  meta?: any;
  timestamp?: string;
  correlationId?: string;
}

async function request<T = any>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, params, headers = {} } = options;

  let authHeader = headers["authorization"] || headers["Authorization"];
  if (!authHeader && typeof window !== "undefined") {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.access_token) {
        authHeader = `Bearer ${session.access_token}`;
      }
    } catch {
      // Ignore if supabase not initialized
    }
  }

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (authHeader) {
    finalHeaders["Authorization"] = authHeader;
  }

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
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    }
    // If response is HTML or plain text (e.g. dev server SPA route fallback), treat as unhandled API route
    return {
      success: false,
      error: `Non-JSON response received: ${contentType || "unknown"}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Network request failed",
    };
  }
}

const BASKET_STORAGE_KEY = "shersha_inquiry_basket";

// ── Cached Admin JWT ──────────────────────────────────────────────────────────
// Caches the backend JWT issued by /api/v1/admin/token so we don't call the
// token endpoint on every product action. Expires after 55 minutes.
let _cachedAdminJwt: string | null = null;
let _cachedAdminJwtExpiry = 0;

async function getAdminJwt(email: string, password: string): Promise<string | null> {
  const now = Date.now();
  if (_cachedAdminJwt && now < _cachedAdminJwtExpiry) return _cachedAdminJwt;
  try {
    const res = await request("/api/v1/admin/token", {
      method: "POST",
      body: { email, secret: password },
    });
    const token = (res as any)?.token ?? (res as any)?.data?.token ?? null;
    if (token) {
      _cachedAdminJwt = token;
      _cachedAdminJwtExpiry = now + 55 * 60 * 1000; // 55 min (JWT is 60 min)
      return token;
    }
  } catch {
    // Token exchange failed — will fall back to localStorage-only
  }
  return null;
}

function getLocalBasketData() {
  if (typeof window === "undefined") return { items: [], totalPairs: 0, totalCartons: 0, subtotal: 0 };
  try {
    const raw = localStorage.getItem(BASKET_STORAGE_KEY) || "[]";
    const items = JSON.parse(raw);
    const totalPairs = items.reduce((sum: number, i: any) => sum + (i.requestedQty || 0), 0);
    const totalCartons = items.reduce((sum: number, i: any) => sum + (i.cartonCount || 1), 0);
    const subtotal = items.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.requestedQty || 0)), 0);
    return { items, totalPairs, totalCartons, subtotal };
  } catch {
    return { items: [], totalPairs: 0, totalCartons: 0, subtotal: 0 };
  }
}

export const apiClient = {
  // 1. Catalog & Search
  catalog: {
    list: async (params?: {
      category?: string;
      gender?: string;
      search?: string;
      city?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => {
      try {
        const res = await request("/api/v1/catalog/products", { params });
        // Gateway returns { success: true, products: [...], meta: {...} } at top level
        // (no .data wrapper) — read res.products directly.
        if (res && res.success && Array.isArray((res as any).products)) {
          return {
            success: true,
            data: {
              products: (res as any).products,
              total: (res as any).total ?? (res as any).meta?.totalCount ?? (res as any).products.length,
            },
          };
        }
        // Also handle if gateway wraps in data (forward-compat)
        if (res && res.success && res.data) return res;
      } catch {}
      let prods = getStoredProducts();
      if (params?.category) {
        prods = prods.filter((p) => p.categorySlug === params.category);
      }
      if (params?.gender && params.gender !== "all") {
        prods = prods.filter((p) => p.gender === params.gender);
      }
      if (params?.search) {
        const q = params.search.toLowerCase().trim();
        prods = prods.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)),
        );
      }
      return { success: true, data: { products: prods, total: prods.length } };
    },

    get: async (slugOrId: string) => {
      try {
        const res = await request(`/api/v1/catalog/products/${slugOrId}`);
        if (res && res.success && res.data) return res;
      } catch {}
      const prod = getProduct(slugOrId);
      if (prod) return { success: true, data: prod };
      return { success: false, error: "Product not found" };
    },

    search: async (query: string, filters?: any) => {
      try {
        const res = await request("/api/v1/catalog/search", { params: { q: query, ...filters } });
        if (res && res.success && res.data) return res;
      } catch {}
      const q = (query || "").toLowerCase().trim();
      const results = getStoredProducts().filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.categorySlug.toLowerCase().includes(q),
      );
      return { success: true, data: results };
    },

    categories: async () => {
      try {
        const res = await request("/api/v1/catalog/categories");
        if (res && res.success && res.data) return res;
      } catch {}
      return { success: true, data: getCategoriesWithCounts() };
    },
  },

  // 2. Wholesale Pricing & Cart Engine
  pricing: {
    calculate: (payload: {
      productSlug?: string;
      productId?: string;
      quantity: number;
      destinationCity: string;
    }) => request("/api/v1/pricing/calculate", { method: "POST", body: payload }),

    calculateCart: (payload: {
      items: Array<{
        productId?: string;
        productSlug?: string;
        quantityPairs: number;
        color?: string;
        sizeRun?: string;
        variantSku?: string;
      }>;
      destinationCity?: string;
    }) => request("/api/v1/cart/calculate", { method: "POST", body: payload }),
  },

  // 2b. Authenticated B2B Basket Engine with 100% Local Fallback
  basket: {
    get: async (headers?: Record<string, string>) => {
      try {
        const res = await request("/api/v1/basket", { method: "GET", headers });
        if (res && res.success && res.data) return res;
      } catch {}
      return { success: true, data: getLocalBasketData() };
    },

    addItem: async (
      payload: {
        productId?: string;
        productSlug: string;
        quantityPairs: number;
        cartonCount?: number;
        color?: string;
        size?: string;
        variantSku?: string;
        idempotencyKey?: string;
      },
      headers?: Record<string, string>,
    ) => {
      try {
        const res = await request("/api/v1/basket/add", { method: "POST", body: payload, headers });
        if (res && res.success) return res;
      } catch {}
      return { success: true, data: payload };
    },

    updateQty: async (payload: { slug: string; quantity: number }, headers?: Record<string, string>) => {
      try {
        const res = await request("/api/v1/basket/qty", { method: "PUT", body: payload, headers });
        if (res && res.success) return res;
      } catch {}
      return { success: true, data: payload };
    },

    removeItem: async (
      slug: string,
      params?: { color?: string; size?: string },
      headers?: Record<string, string>,
    ) => {
      try {
        const res = await request(`/api/v1/basket/${slug}`, { method: "DELETE", params, headers });
        if (res && res.success) return res;
      } catch {}
      return { success: true };
    },

    clear: async (headers?: Record<string, string>) => {
      try {
        const res = await request("/api/v1/basket", { method: "DELETE", headers });
        if (res && res.success) return res;
      } catch {}
      return { success: true };
    },
  },

  // 3. RFQ Negotiation Engine
  rfq: {
    create: (payload: {
      targetQuantity: number;
      customBranding?: boolean;
      notes?: string;
      items: Array<{ productSlug: string; color: string; quantity: number }>;
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

    trackBilti: (biltiNumber: string) => request(`/api/v1/logistics/track-bilti/${biltiNumber}`),

    listHubs: () => request("/api/v1/logistics/hubs"),
  },

  tracking: {
    get: (orderNumber: string) => request(`/api/v1/orders/tracking/${orderNumber}`),
  },

  // 5. Escrow Protection Services
  escrow: {
    getAccountSummary: (userId: string) => request(`/api/v1/escrow/summary/${userId}`),

    createProtection: (payload: {
      orderId: string;
      amount: number;
      inspectionTier?: "STANDARD" | "PREMIUM" | "NONE";
    }) => request("/api/v1/escrow/create", { method: "POST", body: payload }),

    releaseFunds: (escrowId: string) =>
      request(`/api/v1/escrow/release/${escrowId}`, { method: "POST" }),
  },

  // 6. Payments Engine — aligned to gateway CreatePaymentIntentSchema
  payments: {
    createPaymentIntent: (payload: {
      orderId: string;
      amount: number;
      provider: "BANK_TRANSFER" | "DIRECT_BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA" | "PAYFAST";
      currency?: string;
      customerPhone?: string;
      customerEmail?: string;
      orderNumber?: string;
    }) => request("/api/v1/payments/intent", { method: "POST", body: payload }),

    getStatus: (intentId: string) => request(`/api/v1/payments/${intentId}/status`),

    submitBankSlip: (payload: { intentId: string; slipUrl: string; notes?: string }) =>
      request("/api/v1/payments/bank-transfer/confirm-slip", { method: "POST", body: payload }),

    processWebhook: (gateway: string, payload: any, headers?: Record<string, string>) =>
      request(`/api/v1/payments/webhooks/${gateway}`, {
        method: "POST",
        body: payload,
        headers,
      }),
  },

  // 7. Supplier Factory Portal — JWT supplies supplier identity
  supplier: {
    getDashboard: () => request("/api/v1/supplier/dashboard"),

    getAnalytics: () => request("/api/v1/supplier/analytics"),

    submitQuote: (payload: {
      rfqId: string;
      unitPrice: number;
      leadTimeDays?: number;
      productionDays?: number;
      validityDays?: number;
      notes?: string;
    }) =>
      request("/api/v1/supplier/quote", {
        method: "POST",
        body: {
          rfqId: payload.rfqId,
          unitPrice: payload.unitPrice,
          leadTimeDays: payload.leadTimeDays ?? payload.productionDays,
          productionDays: payload.productionDays ?? payload.leadTimeDays,
          notes: payload.notes,
        },
      }),

    getWallet: () => request("/api/v1/supplier/wallet"),

    requestSettlement: (payload: { amount: number; bankAccountIndex?: number }) =>
      request("/api/v1/supplier/settlement/withdraw", {
        method: "POST",
        body: {
          amount: payload.amount,
          bankAccountIndex: payload.bankAccountIndex ?? 0,
        },
      }),
  },

  // 8. Invoicing & Financial Operations
  invoices: {
    generate: (orderNumber: string, params?: { amount?: number; city?: string }) =>
      request(`/api/v1/orders/${orderNumber}/invoice`, { params }),
  },

  // 9. Master Admin Production Authorization API
  admin: {
    getFinancialAnalytics: () => request("/api/v1/admin/finance/revenue"),
    getReconciliationReport: () => request("/api/v1/admin/finance/reconciliation"),

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
        return {
          success: false,
          error: "HTTP 403 Forbidden: Only anamoontotrade@gmail.com can manage catalog items.",
        };
      }

      // Build a signed admin JWT for the backend API call.
      // The api-client is always called from the browser — we call the server-side
      // admin endpoint which verifies the admin session via the Authorization header.
      // We use the internal signToken approach via the API gateway's own token endpoint,
      // but since we cannot call server-only code from the browser, we pass the
      // productData to the real REST endpoint and let the server generate the DB record.
      try {
        let apiRes: any;

        // Obtain a real backend ADMIN JWT to authorize product CRUD calls.
        // Falls back to localStorage-only if token exchange fails (e.g. offline).
        const ADMIN_PASSWORD = "Anamon12&1marcH2007";
        const adminJwt = await getAdminJwt(session.email, ADMIN_PASSWORD);
        const authHeaders: Record<string, string> = adminJwt
          ? { authorization: `Bearer ${adminJwt}` }
          : {};

        if (action === "CREATE") {
          // POST to real backend — server will write to PostgreSQL
          apiRes = await request("/api/v1/admin/products", {
            method: "POST",
            body: productData,
            headers: authHeaders,
          });
          // If backend succeeded, also sync to localStorage so admin dashboard
          // refreshes without a page reload.
          if (apiRes?.success) {
            try { addStoredProduct(productData as Product); } catch { /* non-fatal */ }
          }
        } else if (action === "UPDATE") {
          const slugOrId = productData.slug || productData.sku || "";
          apiRes = await request(`/api/v1/admin/products/${slugOrId}`, {
            method: "PUT",
            body: productData,
            headers: authHeaders,
          });
          if (apiRes?.success) {
            try { updateStoredProduct(slugOrId, productData); } catch { /* non-fatal */ }
          }
        } else if (action === "DELETE") {
          const slugOrId = productData.slug || productData.sku || "";
          apiRes = await request(`/api/v1/admin/products/${slugOrId}`, {
            method: "DELETE",
            headers: authHeaders,
          });
          if (apiRes?.success) {
            try { deleteStoredProduct(slugOrId); } catch { /* non-fatal */ }
          }
        }

        // Check backend response — enforce Hard Fail (no silent local storage fallback)
        if (!apiRes || !apiRes.success) {
          const errMsg =
            (typeof apiRes?.error === "string" ? apiRes.error : apiRes?.error?.message) ||
            apiRes?.message ||
            `Failed to ${action.toLowerCase()} product on backend database.`;
          console.error(`[Admin] Backend product ${action} failed:`, errMsg);
          return {
            success: false,
            error: errMsg,
          };
        }
      } catch (networkErr: any) {
        console.error(`[Admin] Network error during product ${action}:`, networkErr);
        return {
          success: false,
          error: networkErr?.message || `Network error during product ${action.toLowerCase()}.`,
        };
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
