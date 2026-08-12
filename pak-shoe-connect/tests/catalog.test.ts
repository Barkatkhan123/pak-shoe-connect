import { describe, it, expect, vi } from "vitest";
import { CatalogService } from "../src/server/modules/catalog/catalog.service";
import { SearchService } from "../src/server/modules/search/search.service";
import { handleApiRequest } from "../src/server/routes/api.router";
import { prisma } from "../src/server/db";

describe("Catalog & Supplier Ranking System", () => {
  it("should accurately compute Supplier Score & Badges based on 5-factor formula", () => {
    const goldScore = CatalogService.calculateSupplierScore({
      isVerified: true,
      responseRate: 98,
      monthlyCapacity: 20000,
      rating: 4.9,
      totalStock: 3000,
    });

    expect(goldScore.score).toBeGreaterThanOrEqual(85);
    expect(goldScore.badge).toBe("Gold Factory");
    expect(goldScore.breakdown.verificationWeight).toBe(40);

    const unverifiedScore = CatalogService.calculateSupplierScore({
      isVerified: false,
      responseRate: 60,
      monthlyCapacity: 1000,
      rating: 3.5,
      totalStock: 200,
    });

    expect(unverifiedScore.score).toBeLessThan(70);
    expect(unverifiedScore.badge).not.toBe("Gold Factory");
    expect(unverifiedScore.breakdown.verificationWeight).toBe(10);
  });

  it("should list products with bulk pricing tiers, stock totals, and supplier badges", async () => {
    // Mock prisma product response for isolated unit testing
    vi.spyOn(prisma.product, "findMany").mockResolvedValueOnce([
      {
        id: "prod-mock-1",
        slug: "double-sole-peshawari-chappal",
        sku: "SHR-PSH-001",
        title: "Double Sole Peshawari Chappal",
        nameUrdu: "ڈبل تلہ پشاوری چپل",
        description: "Pure handcrafted full-grain cow leather chappal",
        categoryId: "cat-1",
        supplierId: "sup-1",
        moq: 100,
        cartonQty: 24,
        leadTimeDays: "7-12 Days",
        specifications: {},
        images: ["/images/products/peshawari-1.jpg"],
        videoUrls: null,
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          slug: "peshawari-chappal",
          name: "Peshawari Chappal",
          nameUrdu: "پشاوری چپل",
          gender: "men",
          image: "/images/cat-pesh.jpg",
          createdAt: new Date(),
        },
        supplier: {
          id: "sup-1",
          userId: "user-sup-1",
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
        },
        variants: [
          {
            id: "var-1",
            productId: "prod-mock-1",
            colorName: "Black",
            colorHex: "#000000",
            sizeEU: "42",
            sizeUK: "8",
            sizeUS: "9",
            availableStock: 1500,
            reservedStock: 0,
            soldStock: 0,
            variantSku: "SHR-PSH-001-BLK-42",
          },
        ],
        bulkPriceTiers: [
          {
            id: "tier-1",
            productId: "prod-mock-1",
            minQty: 24,
            maxQty: 99,
            unitPrice: { toNumber: () => 1450 } as any,
            tierLabel: "Sample Trial",
          },
          {
            id: "tier-2",
            productId: "prod-mock-1",
            minQty: 500,
            maxQty: null,
            unitPrice: { toNumber: () => 1250 } as any,
            tierLabel: "Container Bulk",
          },
        ],
      } as any,
    ]);

    vi.spyOn(prisma.product, "count").mockResolvedValueOnce(1);

    const res = await CatalogService.listProducts({
      category: "peshawari-chappal",
      supplierVerified: true,
      page: 1,
      limit: 10,
      sort: "supplier_score",
    });

    expect(res.products.length).toBe(1);
    const product = res.products[0];
    expect(product.slug).toBe("double-sole-peshawari-chappal");
    expect(product.supplier.factoryName).toBe("Sialkot Master Syndicate");
    expect(product.supplier.ranking.badge).toBe("Gold Factory");
    expect(product.pricing.lowestBulkPrice).toBe(1250);
    expect(product.inventory.totalAvailablePairs).toBe(1500);
  });

  it("should search catalog by keyword with Postgres fallback", async () => {
    vi.spyOn(prisma.product, "findMany").mockResolvedValueOnce([
      {
        id: "prod-mock-1",
        slug: "double-sole-peshawari-chappal",
        sku: "SHR-PSH-001",
        title: "Double Sole Peshawari Chappal",
        moq: 100,
        supplier: { factoryName: "Sialkot Master Syndicate", city: "Sialkot", verificationStatus: "VERIFIED" },
        category: { name: "Peshawari Chappal" },
        bulkPriceTiers: [{ unitPrice: 1250 }],
      } as any,
    ]);

    const searchRes = await SearchService.searchCatalog("peshawari");

    expect(searchRes.hits.length).toBeGreaterThan(0);
    expect(searchRes.hits[0].title).toContain("Peshawari");
  });

  it("should route catalog listing through API Gateway handler", async () => {
    vi.spyOn(prisma.product, "findMany").mockResolvedValueOnce([]);
    vi.spyOn(prisma.product, "count").mockResolvedValueOnce(0);

    const response = await handleApiRequest(
      "/api/v1/catalog/products",
      "GET",
      {},
      { category: "peshawari-chappal" }
    );

    expect(response.status).toBe(200);
    expect(response.data.products).toBeDefined();
  });
});
