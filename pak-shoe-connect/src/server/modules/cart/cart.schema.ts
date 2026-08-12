import { z } from "zod";

export const CartItemSchema = z.object({
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  quantityPairs: z.coerce.number().int().positive("Quantity must be at least 1 pair"),
  color: z.string().optional().default("Black"),
  sizeRun: z.string().optional().default("EU 39-44 Assorted"),
  variantSku: z.string().optional(),
}).refine((data) => data.productId || data.productSlug, {
  message: "Either productId or productSlug must be provided",
});

export const CalculateCartSchema = z.object({
  items: z.array(CartItemSchema).min(1, "At least one item required in cart"),
  destinationCity: z.string().default("Karachi"),
});

export type CalculateCartInput = z.infer<typeof CalculateCartSchema>;
