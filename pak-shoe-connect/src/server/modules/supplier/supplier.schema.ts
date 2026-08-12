import { z } from "zod";

export const SubmitSupplierQuoteSchema = z.object({
  unitPrice: z.coerce.number().positive("Unit price must be greater than 0"),
  currency: z.string().default("PKR"),
  productionDays: z.coerce.number().int().min(1, "Production lead time must be at least 1 day"),
  minimumOrderQuantity: z.coerce.number().int().positive().optional(),
  paymentTerms: z.string().default("50% advance in Escrow / 50% on dispatch"),
  notes: z.string().optional(),
});

export type SubmitSupplierQuoteInput = z.infer<typeof SubmitSupplierQuoteSchema>;

export const UpdateInventorySchema = z.object({
  availableStock: z.coerce.number().int().min(0),
  reservedStock: z.coerce.number().int().min(0).optional(),
  soldStock: z.coerce.number().int().min(0).optional(),
  reason: z.string().default("MANUAL_SUPPLIER_ADJUSTMENT"),
});

export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    "ESCROW_FUNDED",
    "IN_PRODUCTION",
    "QUALITY_INSPECTION",
    "DISPATCHED",
    "DELIVERED",
    "CANCELLED",
  ]),
  carrierName: z.string().optional(),
  biltiNumber: z.string().optional(),
  trackingNotes: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
