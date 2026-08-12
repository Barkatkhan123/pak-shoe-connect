import { prisma } from "../db";
import { RfqStatus } from "@prisma/client";
import { z } from "zod";

export const CreateRfqItemSchema = z.object({
  productId: z.string().uuid(),
  color: z.string().min(1),
  sizeBreakdown: z.record(z.string(), z.number()), // e.g. { "39": 2, "40": 4, "41": 6, "42": 6, "43": 4, "44": 2 }
  quantity: z.number().int().min(1),
});

export const CreateRfqSchema = z.object({
  buyerId: z.string().uuid(),
  targetQuantity: z.number().int().min(1),
  customBranding: z.boolean().default(false),
  notes: z.string().optional(),
  items: z.array(CreateRfqItemSchema).min(1),
});

export type CreateRfqInput = z.infer<typeof CreateRfqSchema>;

export class RfqService {
  /**
   * Generates unique B2B RFQ identifier (e.g. RFQ-PK-2026-8812)
   */
  private static generateRfqNumber(): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `RFQ-PK-${year}-${randomSuffix}`;
  }

  /**
   * Creates a formal wholesale Request for Quotation
   */
  static async createRfq(input: CreateRfqInput) {
    const validated = CreateRfqSchema.parse(input);
    const rfqNumber = this.generateRfqNumber();

    // Default RFQ validity is 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const rfq = await prisma.rfq.create({
      data: {
        rfqNumber,
        buyerId: validated.buyerId,
        status: RfqStatus.SUBMITTED,
        targetQuantity: validated.targetQuantity,
        customBranding: validated.customBranding,
        notes: validated.notes,
        expiresAt,
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            color: item.color,
            sizeBreakdown: item.sizeBreakdown,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true,
                supplier: {
                  select: {
                    id: true,
                    factoryName: true,
                    user: {
                      select: { phone: true, fullName: true },
                    },
                  },
                },
              },
            },
          },
        },
        buyer: {
          select: { id: true, fullName: true, phone: true, city: true },
        },
      },
    });

    // Audit log entry
    await prisma.auditLog.create({
      data: {
        userId: validated.buyerId,
        action: "RFQ_CREATED",
        entityType: "Rfq",
        entityId: rfq.id,
        newValues: { rfqNumber, targetQuantity: validated.targetQuantity },
      },
    });

    return rfq;
  }

  /**
   * Supplier submits an official quotation with unit rate & lead time
   */
  static async submitSupplierQuote(params: {
    rfqId: string;
    supplierUserId: string;
    quotedUnitPrice: number;
    quotedLeadTime: string;
  }) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: params.rfqId },
      include: { items: { include: { product: true } } },
    });

    if (!rfq) {
      throw new Error(`RFQ not found with ID: ${params.rfqId}`);
    }

    if (rfq.status !== RfqStatus.SUBMITTED) {
      throw new Error(`Cannot quote on RFQ with status: ${rfq.status}`);
    }

    const updated = await prisma.rfq.update({
      where: { id: params.rfqId },
      data: {
        status: RfqStatus.SUPPLIER_QUOTED,
        quotedUnitPrice: params.quotedUnitPrice,
        quotedLeadTime: params.quotedLeadTime,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: params.supplierUserId,
        action: "SUPPLIER_QUOTED",
        entityType: "Rfq",
        entityId: rfq.id,
        newValues: {
          quotedUnitPrice: params.quotedUnitPrice,
          quotedLeadTime: params.quotedLeadTime,
        },
      },
    });

    return updated;
  }

  /**
   * Buyer accepts the quotation to proceed to binding order & escrow
   */
  static async acceptQuote(rfqId: string, buyerId: string) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
    });

    if (!rfq || rfq.buyerId !== buyerId) {
      throw new Error("Unauthorized or RFQ not found");
    }

    if (rfq.status !== RfqStatus.SUPPLIER_QUOTED) {
      throw new Error("Only quoted RFQs can be accepted");
    }

    return await prisma.rfq.update({
      where: { id: rfqId },
      data: { status: RfqStatus.BUYER_ACCEPTED },
    });
  }
}
