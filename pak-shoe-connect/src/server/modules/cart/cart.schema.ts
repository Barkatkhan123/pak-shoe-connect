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

export const AddBasketItemSchema = z.object({
  productId: z.string().optional(),
  productSlug: z.string({ required_error: "Product slug is required" }),
  quantityPairs: z.coerce.number().int().positive("Quantity must be at least 1 pair"),
  cartonCount: z.coerce.number().int().positive().optional(),
  color: z.string().optional().default("Standard"),
  size: z.string().optional().default("Assorted"),
  variantSku: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export type AddBasketItemInput = z.infer<typeof AddBasketItemSchema>;

export interface ServerBasketItem {
  slug: string;
  productId?: string;
  name: string;
  sku: string;
  image: string;
  moq: number;
  cartonQty: number;
  requestedQty: number;
  cartonCount: number;
  color: string;
  size: string;
  priceLabel: string;
  unitPrice: number;
  subtotal: number;
  tierName: string;
  addedAt: string;
  idempotencyKey?: string;
}

