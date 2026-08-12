import { describe, it, expect, vi } from "vitest";
import { handleApiRequest } from "../src/server/routes/api.router";
import { prisma } from "../src/server/db";

describe("Security Regression & Data Leakage Tests", () => {
  // Test 1: Password / passwordHash Leakage Prevention
  it("should never expose passwordHash, password, or hashedPassword in order/buyer payloads", async () => {
    // Mock prisma order search for tracking
    vi.spyOn(prisma.order, "findFirst").mockResolvedValueOnce({
      id: "order-123",
      orderNumber: "ORD-PK-2026-1002",
      status: "PENDING_PAYMENT",
      totalAmount: 15000,
      createdAt: new Date(),
      shippingCity: "Lahore",
      buyer: {
        id: "buyer-uuid",
        fullName: "Hamza Malik",
        email: "hamza@buyer.pk",
        phone: "+923009988771",
        city: "Lahore",
        passwordHash: "$2b$10$insecuresaltandhashvalueforbuyeracc", // should be ignored/absent in mapped select
      },
      supplier: {
        id: "sup-1",
        factoryName: "Apex Footwear Ltd",
        city: "Lahore",
      },
      items: []
    } as any);

    const res = await handleApiRequest(
      "/api/v1/orders/tracking/ORD-PK-2026-1002",
      "GET",
      {},
      {},
      { "x-correlation-id": "test-correlation-uuid" }
    );

    expect(res.status).toBe(200);
    const bodyStr = JSON.stringify(res.data);
    
    // Ensure no password hashes leak in payload
    expect(bodyStr).not.toContain("passwordHash");
    expect(bodyStr).not.toContain("password");
    expect(bodyStr).not.toContain("hashedPassword");
    
    // Check that we got the allowed public tracking details
    expect(res.data.tracking.orderNumber).toBe("ORD-PK-2026-1002");
    expect(res.data.tracking.destinationCity).toBe("Lahore");
  });

  // Test 2: Supplier Data Leakage Prevention
  it("should strip sensitive supplier tax numbers and internal limits from product responses", async () => {
    vi.spyOn(prisma.product, "findFirst").mockResolvedValueOnce({
      id: "prod-1",
      slug: "sports-running-shoes",
      sku: "SHR-SPT-001",
      title: "Sports Running Shoes",
      nameUrdu: "سپورٹس رننگ جوتے",
      description: "Comfortable running shoes",
      categoryId: "cat-1",
      supplierId: "sup-1",
      moq: 100,
      cartonQty: 24,
      leadTimeDays: "10 Days",
      images: ["/img1.jpg"],
      videoUrls: null,
      isActive: true,
      category: { id: "cat-1", name: "Sports", slug: "sports", gender: "men" },
      supplier: {
        id: "sup-1",
        factoryName: "Apex Footwear Ltd",
        city: "Lahore",
        ntnTaxNumber: "NTN-881122-9", // SENSITIVE
        productionCapacity: 60000,     // SENSITIVE
        rfqQuota: 45,                  // SENSITIVE
        verificationStatus: "VERIFIED",
        responseRate: 98,
        avgReplyTime: 2,
      },
      variants: [],
      bulkPriceTiers: [],
    } as any);

    const res = await handleApiRequest(
      "/api/v1/catalog/products/sports-running-shoes",
      "GET",
      {},
      {},
      { "x-correlation-id": "test-correlation-uuid" }
    );

    expect(res.status).toBe(200);
    const supplierData = res.data.product.supplier;

    // Verify public properties exist
    expect(supplierData.factoryName).toBe("Apex Footwear Ltd");
    expect(supplierData.city).toBe("Lahore");

    // Verify sensitive properties are omitted
    expect(supplierData.ntnTaxNumber).toBeUndefined();
    expect(supplierData.productionCapacity).toBeUndefined();
    expect(supplierData.rfqQuota).toBeUndefined();
    
    const bodyStr = JSON.stringify(res.data);
    expect(bodyStr).not.toContain("NTN-881122-9");
  });

  // Test 3: Prisma Error Sanitization / Mapping
  it("should sanitize raw database errors and map them to standard operational AppError structures", async () => {
    // Mock a prisma findFirst call to reject with a PrismaKnownRequestError
    const prismaError = new Error("Record not found");
    (prismaError as any).code = "P2025";
    (prismaError as any).constructor = { name: "PrismaClientKnownRequestError" };
    
    vi.spyOn(prisma.product, "findFirst").mockRejectedValueOnce(prismaError);

    const res = await handleApiRequest(
      "/api/v1/catalog/products/non-existent-slug",
      "GET",
      {},
      {},
      { "x-correlation-id": "err-correlation-uuid" }
    );

    // Should return 404 instead of 500 or throwing
    expect(res.status).toBe(404);
    expect(res.data.success).toBe(false);
    expect(res.data.error.code).toBe("NOT_FOUND");
    expect(res.data.error.message).toBe("Requested resource not found");
    expect(res.data.error.correlationId).toBe("err-correlation-uuid");

    // Ensure database internals do not leak
    const bodyStr = JSON.stringify(res.data);
    expect(bodyStr).not.toContain("P2025");
    expect(bodyStr).not.toContain("PrismaClient");
  });
});
