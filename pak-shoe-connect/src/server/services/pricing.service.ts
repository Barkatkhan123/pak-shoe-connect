import { prisma } from "../db";
import { z } from "zod";

// Zod validation schema for pricing calculation requests
export const CalculatePricingSchema = z.object({
  productId: z.string().optional(),
  productSlug: z.string().optional(),
  quantity: z.number().int().min(1),
  destinationCity: z.string().default("Lahore"),
});

export type CalculatePricingInput = z.infer<typeof CalculatePricingSchema>;

export interface PricingCalculationResult {
  productId: string;
  productTitle: string;
  sku: string;
  moq: number;
  cartonQty: number;
  orderedPairs: number;
  cartonsCount: number;
  isMoqMet: boolean;
  unitPrice: number;
  currency: string;
  subtotal: number;
  activeTier: {
    minQty: number;
    maxQty: number | null;
    unitPrice: number;
    tierLabel: string;
  };
  retailComparison: {
    estimatedRetailMSRP: number;
    totalRetailValue: number;
    totalBuyerSavings: number;
    savingsPercentage: number;
    retailProfitMarginPercentage: number;
  };
  logistics: {
    destinationCity: string;
    estimatedFreightPerCarton: number;
    totalEstimatedFreight: number;
  };
  nextTierUpsell: {
    hasNextTier: boolean;
    requiredQty: number;
    additionalPairsNeeded: number;
    potentialUnitPrice: number;
    potentialSavingsPerPair: number;
  } | null;
}

// City freight rates per 24-pair master carton (in PKR)
const CITY_FREIGHT_RATES: Record<string, number> = {
  Lahore: 450,
  Faisalabad: 500,
  Gujranwala: 450,
  Sialkot: 400,
  "Rawalpindi / Islamabad": 650,
  Peshawar: 750,
  Multan: 600,
  Karachi: 950,
  Quetta: 1100,
  "Dubai / GCC Port": 9800, // Approx $35 USD in PKR
};

export class PricingService {
  /**
   * Calculate exact wholesale price breaks, carton allocations, and margins
   */
  static async calculate(input: CalculatePricingInput): Promise<PricingCalculationResult> {
    const validated = CalculatePricingSchema.parse(input);
    const { productId, productSlug, quantity, destinationCity } = validated;

    if (!productId && !productSlug) {
      throw new Error("Either productId or productSlug must be provided");
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          ...(productId ? [{ id: productId }] : []),
          ...(productSlug ? [{ slug: productSlug }] : []),
        ],
      },
      include: {
        bulkPriceTiers: {
          orderBy: { minQty: "asc" },
        },
      },
    });

    if (!product) {
      throw new Error(`Product not found with id: ${productId} or slug: ${productSlug}`);
    }

    const moq = product.moq || 24;
    const cartonQty = product.cartonQty || 24;
    const cartonsCount = Math.ceil(quantity / cartonQty);
    const minTierQty = product.bulkPriceTiers.length > 0 ? product.bulkPriceTiers[0].minQty : moq;
    const isMoqMet = quantity >= moq && quantity >= minTierQty;

    const tiers = product.bulkPriceTiers.map((t) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      unitPrice: Number(t.unitPrice),
      tierLabel: t.tierLabel,
    }));

    if (tiers.length === 0) {
      throw new Error("No bulk price tiers configured for this product.");
    }

    // Determine active price tier
    let activeTier = tiers[0];
    for (const tier of tiers) {
      if (quantity >= tier.minQty) {
        activeTier = tier;
      }
    }

    const unitPrice = activeTier.unitPrice;
    const subtotal = unitPrice * quantity;

    // Retail profit margin comparison (Industry standard B2B: retail MSRP ~ 1.55x - 1.8x wholesale)
    const baseFirstTierPrice = tiers[0].unitPrice;
    const estimatedRetailMSRP = Math.round(baseFirstTierPrice * 1.65);
    const totalRetailValue = estimatedRetailMSRP * quantity;
    const totalBuyerSavings = totalRetailValue - subtotal;
    const savingsPercentage = Math.round(
      ((estimatedRetailMSRP - unitPrice) / estimatedRetailMSRP) * 100,
    );
    const retailProfitMarginPercentage = Math.round(
      ((estimatedRetailMSRP - unitPrice) / unitPrice) * 100,
    );

    // Logistics freight calculation
    const freightRatePerCarton = CITY_FREIGHT_RATES[destinationCity] ?? 650;
    const totalEstimatedFreight = freightRatePerCarton * cartonsCount;

    // Next tier upsell calculation
    const currentTierIndex = tiers.findIndex((t) => t.minQty === activeTier.minQty);
    let nextTierUpsell: PricingCalculationResult["nextTierUpsell"] = null;

    if (currentTierIndex < tiers.length - 1) {
      const nextTier = tiers[currentTierIndex + 1];
      const additionalPairsNeeded = nextTier.minQty - quantity;
      const potentialSavingsPerPair = unitPrice - nextTier.unitPrice;

      nextTierUpsell = {
        hasNextTier: true,
        requiredQty: nextTier.minQty,
        additionalPairsNeeded,
        potentialUnitPrice: nextTier.unitPrice,
        potentialSavingsPerPair,
      };
    }

    return {
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      moq,
      cartonQty,
      orderedPairs: quantity,
      cartonsCount,
      isMoqMet,
      unitPrice,
      currency: "PKR",
      subtotal,
      activeTier,
      retailComparison: {
        estimatedRetailMSRP,
        totalRetailValue,
        totalBuyerSavings,
        savingsPercentage,
        retailProfitMarginPercentage,
      },
      logistics: {
        destinationCity,
        estimatedFreightPerCarton: freightRatePerCarton,
        totalEstimatedFreight,
      },
      nextTierUpsell,
    };
  }
}
