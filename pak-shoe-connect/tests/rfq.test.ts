import { describe, it, expect, beforeEach, vi } from "vitest";
import { RfqService } from "../src/server/services/rfq.service";
import { prisma } from "../src/server/db";
import { RfqStatus } from "@prisma/client";

describe("RFQ Negotiation & Lifecycle State Machine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create an RFQ with human-readable number and SUBMITTED status", async () => {
    const mockRfq = {
      id: "rfq-101",
      rfqNumber: "RFQ-PK-2026-8812",
      buyerId: "11111111-1111-1111-1111-111111111111",
      status: RfqStatus.SUBMITTED,
      targetQuantity: 3000,
      customBranding: true,
      notes: "Requires embossed brand on insole and gold foil on box",
    };

    vi.spyOn(prisma.rfq, "create").mockResolvedValueOnce(mockRfq as any);
    vi.spyOn(prisma.auditLog, "create").mockResolvedValueOnce({} as any);

    const rfq = await RfqService.createRfq({
      buyerId: "11111111-1111-1111-1111-111111111111",
      targetQuantity: 3000,
      customBranding: true,
      notes: "Requires embossed brand on insole and gold foil on box",
      items: [
        {
          productId: "22222222-2222-2222-2222-222222222222",
          color: "Onyx Black",
          sizeBreakdown: { "40": 500, "41": 1000, "42": 1000, "43": 500 },
          quantity: 3000,
        },
      ],
    });

    expect(rfq.status).toBe(RfqStatus.SUBMITTED);
    expect(rfq.targetQuantity).toBe(3000);
    expect(rfq.customBranding).toBe(true);
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("should transition RFQ to SUPPLIER_QUOTED when supplier quotes a unit rate", async () => {
    vi.spyOn(prisma.rfq, "findUnique").mockResolvedValueOnce({
      id: "rfq-101",
      status: RfqStatus.SUBMITTED,
    } as any);

    vi.spyOn(prisma.rfq, "update").mockResolvedValueOnce({
      id: "rfq-101",
      status: RfqStatus.SUPPLIER_QUOTED,
      quotedUnitPrice: 1400.0,
      quotedLeadTime: "10 Days Dispatch",
    } as any);

    vi.spyOn(prisma.auditLog, "create").mockResolvedValueOnce({} as any);

    const updated = await RfqService.submitSupplierQuote({
      rfqId: "rfq-101",
      supplierUserId: "supp-001",
      quotedUnitPrice: 1400.0,
      quotedLeadTime: "10 Days Dispatch",
    });

    expect(updated.status).toBe(RfqStatus.SUPPLIER_QUOTED);
    expect(updated.quotedUnitPrice).toBe(1400.0);
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
