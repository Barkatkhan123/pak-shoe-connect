import { z } from "zod";

export const ProductListQuerySchema = z.object({
  category: z.string().optional(),
  gender: z.enum(["men", "women", "kids", "unisex"]).optional(),
  supplierVerified: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  moqMax: z.coerce.number().optional(),
  color: z.string().optional(),
  sizeEU: z.string().optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  sort: z
    .enum(["supplier_score", "price_asc", "price_desc", "moq_asc", "newest"])
    .default("supplier_score"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;

export interface SupplierRankingScore {
  score: number; // 0-100 score
  badge: "Gold Factory" | "Silver Manufacturer" | "Verified Supplier" | "Starter Workshop";
  breakdown: {
    verificationWeight: number;
    responseSpeedWeight: number;
    capacityWeight: number;
    reviewRatingWeight: number;
  };
}
