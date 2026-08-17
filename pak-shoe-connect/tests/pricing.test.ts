import { describe, it, expect, beforeEach, vi } from "vitest";
import { PricingService } from "../src/server/services/pricing.service";
import { prisma } from "../src/server/db";

describe("Wholesale Pricing Engine (B2B Volume Breaks & Margin)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should calculate Starter Wholesale tier for 24 pairs (MOQ)", async () => {
    // Mock product with 4 wholesale tiers
    vi.spyOn(prisma.product, "findFirst").mockResolvedValueOnce({
      id: "prod-001",
      slug: "charsadda-classic-peshawari",
      sku: "SHR-PSH-001",
      title: "Charsadda Double-Sole Chappal",
      moq: 24,
      cartonQty: 24,
      bulkPriceTiers: [
        {
          id: "t1",
          productId: "prod-001",
          minQty: 24,
          maxQty: 49,
          unitPrice: 1850.0,
          tierLabel: "Starter Wholesale",
        },
        {
          id: "t2",
          productId: "prod-001",
          minQty: 50,
          maxQty: 199,
          unitPrice: 1650.0,
          tierLabel: "Dealer Batch",
        },
        {
          id: "t3",
          productId: "prod-001",
          minQty: 200,
          maxQty: 499,
          unitPrice: 1450.0,
          tierLabel: "Wholesale Master",
        },
        {
          id: "t4",
          productId: "prod-001",
          minQty: 500,
          maxQty: null,
          unitPrice: 1299.0,
          tierLabel: "Container Bulk",
        },
      ],
    } as any);

    const result = await PricingService.calculate({
      productSlug: "charsadda-classic-peshawari",
      quantity: 24,
      destinationCity: "Lahore",
    });

    expect(result.isMoqMet).toBe(true);
    expect(result.orderedPairs).toBe(24);
    expect(result.cartonsCount).toBe(1);
    expect(result.unitPrice).toBe(1850);
    expect(result.subtotal).toBe(44400); // 24 * 1850
    expect(result.activeTier.tierLabel).toBe("Starter Wholesale");
    expect(result.logistics.totalEstimatedFreight).toBe(450); // Lahore freight = 450/ctn
    expect(result.nextTierUpsell?.hasNextTier).toBe(true);
    expect(result.nextTierUpsell?.additionalPairsNeeded).toBe(26); // 50 - 24
    expect(result.nextTierUpsell?.potentialUnitPrice).toBe(1650);
  });

  it("should calculate Container Bulk tier (500 pairs) with maximum discount & freight to Karachi", async () => {
    vi.spyOn(prisma.product, "findFirst").mockResolvedValueOnce({
      id: "prod-001",
      slug: "charsadda-classic-peshawari",
      sku: "SHR-PSH-001",
      title: "Charsadda Double-Sole Chappal",
      moq: 24,
      cartonQty: 24,
      bulkPriceTiers: [
        {
          id: "t1",
          productId: "prod-001",
          minQty: 24,
          maxQty: 49,
          unitPrice: 1850.0,
          tierLabel: "Starter Wholesale",
        },
        {
          id: "t2",
          productId: "prod-001",
          minQty: 50,
          maxQty: 199,
          unitPrice: 1650.0,
          tierLabel: "Dealer Batch",
        },
        {
          id: "t3",
          productId: "prod-001",
          minQty: 200,
          maxQty: 499,
          unitPrice: 1450.0,
          tierLabel: "Wholesale Master",
        },
        {
          id: "t4",
          productId: "prod-001",
          minQty: 500,
          maxQty: null,
          unitPrice: 1299.0,
          tierLabel: "Container Bulk",
        },
      ],
    } as any);

    const result = await PricingService.calculate({
      productSlug: "charsadda-classic-peshawari",
      quantity: 500,
      destinationCity: "Karachi",
    });

    expect(result.cartonsCount).toBe(21); // ceil(500 / 24) = 21 cartons
    expect(result.unitPrice).toBe(1299);
    expect(result.subtotal).toBe(649500); // 500 * 1299
    expect(result.activeTier.tierLabel).toBe("Container Bulk");
    expect(result.logistics.totalEstimatedFreight).toBe(19950); // 21 cartons * 950 PKR
    expect(result.retailComparison.totalBuyerSavings).toBeGreaterThan(500000);
    expect(result.nextTierUpsell).toBeNull(); // Top tier reached!
  });
});
