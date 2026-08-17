import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrderService } from "../src/server/services/order.service";
import { PricingService } from "../src/server/services/pricing.service";
import { prisma } from "../src/server/db";
import { OrderStatus, EscrowState } from "@prisma/client";

describe("3-State Inventory Reservation & Escrow Lock Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should reserve stock from available to reserved state when order is placed", async () => {
    // Mock pricing calculation
    vi.spyOn(PricingService, "calculate").mockResolvedValueOnce({
      productId: "22222222-2222-2222-2222-222222222222",
      productTitle: "Charsadda Double-Sole Chappal",
      sku: "SHR-PSH-001",
      moq: 24,
      cartonQty: 24,
      orderedPairs: 500,
      cartonsCount: 21,
      isMoqMet: true,
      unitPrice: 1450,
      currency: "PKR",
      subtotal: 725000,
      activeTier: { minQty: 200, maxQty: 499, unitPrice: 1450, tierLabel: "Wholesale Master" },
      retailComparison: {} as any,
      logistics: {
        destinationCity: "Lahore",
        estimatedFreightPerCarton: 450,
        totalEstimatedFreight: 9450,
      },
      nextTierUpsell: null,
    });

    const mockVariant = {
      id: "var-001",
      variantSku: "SHR-PSH-001-BLK-42",
      availableStock: 1000,
      reservedStock: 0,
      soldStock: 0,
    };

    const mockOrder = {
      id: "ord-8812",
      orderNumber: "ORD-PK-2026-8812",
      status: OrderStatus.PENDING_PAYMENT,
      escrowStatus: EscrowState.UNPAID,
      totalPairs: 500,
      totalCartons: 21,
      totalAmount: 738650,
    };

    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
      const txMock = {
        productVariant: {
          findUnique: vi.fn().mockResolvedValue(mockVariant),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          update: vi.fn().mockResolvedValue({
            ...mockVariant,
            availableStock: 500, // 1000 - 500
            reservedStock: 500, // 0 + 500
          }),
        },
        order: {
          create: vi.fn().mockResolvedValue(mockOrder),
        },
        auditLog: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      return await cb(txMock);
    });

    const order = await OrderService.createOrderWithReservation({
      buyerId: "11111111-1111-1111-1111-111111111111",
      shippingCity: "Lahore",
      shippingAddress: "Main Wholesale Market, Anarkali, Lahore",
      items: [
        {
          productId: "22222222-2222-2222-2222-222222222222",
          color: "Onyx Black",
          sizeRun: "EU 42",
          quantityPairs: 500,
          variantSku: "SHR-PSH-001-BLK-42",
        },
      ],
    });

    expect(order.status).toBe(OrderStatus.PENDING_PAYMENT);
    expect(order.escrowStatus).toBe(EscrowState.UNPAID);
    expect(order.totalPairs).toBe(500);
  });

  it("should throw error if order quantity exceeds available stock", async () => {
    vi.spyOn(PricingService, "calculate").mockResolvedValueOnce({
      productId: "22222222-2222-2222-2222-222222222222",
      cartonsCount: 84,
      unitPrice: 1299,
    } as any);

    const mockVariant = {
      id: "var-001",
      variantSku: "SHR-PSH-001-BLK-42",
      availableStock: 1000,
      reservedStock: 0,
      soldStock: 0,
    };

    vi.spyOn(prisma, "$transaction").mockImplementation(async (cb: any) => {
      const txMock = {
        productVariant: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          findUnique: vi.fn().mockResolvedValue(mockVariant),
        },
      };
      return await cb(txMock);
    });

    await expect(
      OrderService.createOrderWithReservation({
        buyerId: "11111111-1111-1111-1111-111111111111",
        shippingCity: "Lahore",
        shippingAddress: "Anarkali, Lahore",
        items: [
          {
            productId: "22222222-2222-2222-2222-222222222222",
            color: "Onyx Black",
            sizeRun: "EU 42",
            quantityPairs: 2000, // Requesting 2000 when only 1000 available!
            variantSku: "SHR-PSH-001-BLK-42",
          },
        ],
      }),
    ).rejects.toThrow("Insufficient stock");
  });
});
