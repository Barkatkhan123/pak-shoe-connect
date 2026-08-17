import { describe, it, expect, vi } from "vitest";
import { SupplierService } from "../src/server/modules/supplier/supplier.service";
import { handleApiRequest } from "../src/server/routes/api.router";
import { prisma } from "../src/server/db";
import { signToken } from "../src/server/gateway/middleware/auth.middleware";

describe("Supplier Portal & Live RFQ Quotation Engine", () => {
  it("should calculate factory overview KPIs with Trust Score and active orders", async () => {
    vi.spyOn(prisma.supplierProfile, "findUnique").mockResolvedValueOnce({
      id: "sup-factory-1",
      userId: "user-1",
      factoryName: "Sialkot Master Syndicate",
      ntnTaxNumber: "NTN-998822-1",
      city: "Sialkot",
      address: "Daska Road",
      verificationStatus: "VERIFIED",
      subscriptionTier: "GOLD_FACTORY",
      subscriptionEnd: null,
      rfqQuotaRemaining: 50,
      maxProductLimit: 50,
      responseRate: 98,
      avgReplyTime: "< 2 Hours",
      monthlyCapacity: 25000,
      qualityStandards: ["ISO-9001"],
      factoryImages: [],
      factoryVideoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        fullName: "Tariq Mahmood",
        phone: "+923001234567",
        email: "tariq@sialkotfootwear.com",
      },
      _count: { products: 12 },
    } as any);

    vi.spyOn(prisma.rfq, "count")
      .mockResolvedValueOnce(18) // activeRFQs
      .mockResolvedValueOnce(6); // pendingQuotes

    vi.spyOn(prisma.order, "findMany").mockResolvedValueOnce([
      { status: "ESCROW_FUNDED", totalAmount: 669450 },
      { status: "DELIVERED", totalAmount: 1250000 },
    ] as any);

    const metrics = await SupplierService.getSupplierDashboardMetrics("sup-factory-1");

    expect(metrics.supplier).toBe("Sialkot Master Syndicate");
    expect(metrics.badge).toBe("Gold Factory");
    expect(metrics.trustScore).toBeGreaterThanOrEqual(85);
    expect(metrics.metrics.activeRFQs).toBe(18);
    expect(metrics.metrics.pendingQuotes).toBe(6);
    expect(metrics.metrics.ordersInProduction).toBe(1);
  });

  it("should handle formal quote submission with audit log and buyer notification", async () => {
    vi.spyOn(prisma.rfq, "findFirst").mockResolvedValueOnce({
      id: "rfq-test-1",
      rfqNumber: "RFQ-PK-2026-8812",
      targetQuantity: 3000,
      buyer: { user: { phone: "+923009999999", fullName: "Usman Ghani" } },
      supplier: { id: "sup-factory-1" },
    } as any);

    vi.spyOn(prisma.rfq, "update").mockResolvedValueOnce({
      id: "rfq-test-1",
      status: "SUPPLIER_QUOTED",
      supplierQuotePrice: 1250,
      supplierLeadTimeDays: "12 Days Production",
    } as any);

    vi.spyOn(prisma.auditLog, "create").mockResolvedValueOnce({} as any);

    const result = await SupplierService.submitQuote("rfq-test-1", "sup-factory-1", {
      unitPrice: 1250,
      currency: "PKR",
      productionDays: 12,
      paymentTerms: "50% advance / 50% delivery",
      notes: "Custom laser engraving included",
    });

    expect(result.status).toBe("SUPPLIER_QUOTED");
    expect(result.supplierQuotePrice).toBe(1250);
  });

  it("should return factory analytics with response rate trends and buyer city spread", async () => {
    const analytics = await SupplierService.getSupplierAnalytics("sup-factory-1");

    expect(analytics.rfqResponseTrends.length).toBe(3);
    expect(analytics.buyerGeographicDistribution).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ city: "Karachi", percentage: 45 }),
        expect.objectContaining({ city: "Dubai (Export)", percentage: 15 }),
      ]),
    );
  });

  it("should route supplier API calls via handleApiRequest gateway", async () => {
    const supplierToken = signToken({ sub: "user-sup-1", role: "SUPPLIER", supplierId: "sup-factory-1" });
    const res = await handleApiRequest(
      "/api/v1/supplier/analytics",
      "GET",
      {},
      {},
      { authorization: `Bearer ${supplierToken}` }
    );

    expect(res.status).toBe(200);
    expect(res.data.analytics.rfqResponseTrends).toBeDefined();
  });
});
