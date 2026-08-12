import { describe, it, expect, vi, beforeEach } from "vitest";
import { CartService } from "../src/server/modules/cart/cart.service";
import { TrackingService } from "../src/server/modules/tracking/tracking.service";
import { handleApiRequest } from "../src/server/routes/api.router";
import { prisma } from "../src/server/db";

const TEST_PRODUCT_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("Step 6: Buyer Marketplace UI & Cart/Tracking Ordering Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should calculate bulk cart totals with pairs, cartons, and destination freight", async () => {
    vi.spyOn(prisma.product, "findFirst").mockResolvedValueOnce({
      id: TEST_PRODUCT_ID,
      slug: "charsadda-classic-peshawari",
      sku: "SHR-PSH-001",
      title: "Charsadda Double-Sole Chappal",
      moq: 24,
      cartonQty: 24,
      bulkPriceTiers: [
        { id: "t1", productId: TEST_PRODUCT_ID, minQty: 24, maxQty: 49, unitPrice: 1850.0, tierLabel: "Starter Wholesale" },
        { id: "t2", productId: TEST_PRODUCT_ID, minQty: 50, maxQty: 199, unitPrice: 1650.0, tierLabel: "Dealer Batch" },
        { id: "t3", productId: TEST_PRODUCT_ID, minQty: 200, maxQty: 499, unitPrice: 1450.0, tierLabel: "Wholesale Master" },
        { id: "t4", productId: TEST_PRODUCT_ID, minQty: 500, maxQty: null, unitPrice: 1299.0, tierLabel: "Container Bulk" },
      ],
    } as any);

    const result = await CartService.calculateCart({
      destinationCity: "Karachi",
      items: [
        {
          productId: TEST_PRODUCT_ID,
          quantityPairs: 500,
          color: "Black",
          sizeRun: "EU 39-44 Assorted",
        },
      ],
    });

    expect(result.pairs).toBe(500);
    expect(result.cartons).toBe(21);
    expect(result.productTotal).toBe(649500); // 500 * 1299
    expect(result.freight).toBe(19950); // 21 * 950
    expect(result.grandTotal).toBe(669450);
  });

  it("should return live Bilti and production tracking timeline", async () => {
    const tracking = await TrackingService.getOrderTracking("ORD-PK-2026-9901");

    expect(tracking.orderNumber).toBe("ORD-PK-2026-9901");
    expect(tracking.status).toBe("DISPATCHED");
    expect(tracking.carrierName).toContain("Faisal Movers");
    expect(tracking.biltiNumber).toBe("FM-BILTI-LHR-88219");
    expect(tracking.timeline.length).toBe(5);
    expect(tracking.timeline[0].step).toBe("ESCROW_FUNDED");
    expect(tracking.timeline[3].step).toBe("DISPATCHED");
    expect(tracking.timeline[3].completed).toBe(true);
  });

  it("should route cart calculation and tracking via handleApiRequest gateway", async () => {
    vi.spyOn(prisma.product, "findFirst").mockResolvedValueOnce({
      id: TEST_PRODUCT_ID,
      slug: "charsadda-classic-peshawari",
      sku: "SHR-PSH-001",
      title: "Charsadda Double-Sole Chappal",
      moq: 24,
      cartonQty: 24,
      bulkPriceTiers: [
        { id: "t1", productId: TEST_PRODUCT_ID, minQty: 24, maxQty: 49, unitPrice: 1850.0, tierLabel: "Starter Wholesale" },
        { id: "t2", productId: TEST_PRODUCT_ID, minQty: 50, maxQty: 199, unitPrice: 1650.0, tierLabel: "Dealer Batch" },
      ],
    } as any);

    const cartRes = await handleApiRequest("/api/v1/cart/calculate", "POST", {
      destinationCity: "Lahore",
      items: [{ productId: TEST_PRODUCT_ID, quantityPairs: 100 }],
    });

    expect(cartRes.status).toBe(200);
    expect(cartRes.data.success).toBe(true);
    expect(cartRes.data.pairs).toBe(100);

    const trackingRes = await handleApiRequest(
      "/api/v1/orders/tracking/ORD-PK-2026-9901",
      "GET"
    );

    expect(trackingRes.status).toBe(200);
    expect(trackingRes.data.tracking.biltiNumber).toBeDefined();
  });
});
