import { useMemo } from "react";
import type { EnterpriseProduct, BulkPricingTier } from "@/types/product";

export interface PricingCalculation {
  quantity: number;
  unitPrice: number;
  retailPrice: number;
  subtotal: number;
  retailTotal: number;
  totalSavings: number;
  savingsPercentage: number;
  profitMarginPercentage: number;
  activeTier: BulkPricingTier;
  activeTierIndex: number;
  cartonsCount: number;
  isMoqMet: boolean;
  moq: number;
  currency: string;
  nextTier?: {
    requiredQty: number;
    additionalPairs: number;
    potentialUnitPrice: number;
    potentialSavingsPerPair: number;
  };
}

const NULL_PRICING: PricingCalculation = {
  quantity: 0,
  unitPrice: 0,
  retailPrice: 0,
  subtotal: 0,
  retailTotal: 0,
  totalSavings: 0,
  savingsPercentage: 0,
  profitMarginPercentage: 0,
  activeTier: { minQuantity: 0, unitPrice: 0, label: "-", savingsPct: 0 } as BulkPricingTier,
  activeTierIndex: 0,
  cartonsCount: 0,
  isMoqMet: false,
  moq: 0,
  currency: "PKR",
};

export function usePricingCalculator(
  product: EnterpriseProduct | null | undefined,
  quantity: number,
): PricingCalculation {
  return useMemo(() => {
    if (!product) return NULL_PRICING;
    const moq = product.inventory.moq || 12;
    const cartonQty = product.inventory.cartonQty || 12;
    const validQty = Math.max(1, quantity);
    const isMoqMet = validQty >= moq;

    // Find active tier
    const tiers = product.bulkPricing;
    let activeTierIndex = 0;

    for (let i = tiers.length - 1; i >= 0; i--) {
      if (validQty >= tiers[i].minQuantity) {
        activeTierIndex = i;
        break;
      }
    }

    const activeTier = tiers[activeTierIndex] || tiers[0];
    const unitPrice = activeTier.unitPrice;
    const retailPrice = product.pricing.retailPrice;

    const subtotal = validQty * unitPrice;
    const retailTotal = validQty * retailPrice;
    const totalSavings = Math.max(0, retailTotal - subtotal);
    const savingsPercentage =
      retailPrice > 0 ? Math.round(((retailPrice - unitPrice) / retailPrice) * 100) : 0;
    const profitMarginPercentage =
      unitPrice > 0 ? Math.round(((retailPrice - unitPrice) / unitPrice) * 100) : 0;

    const cartonsCount = Math.ceil(validQty / cartonQty);

    // Next tier calculation for upselling
    let nextTier: PricingCalculation["nextTier"] = undefined;
    if (activeTierIndex < tiers.length - 1) {
      const upcoming = tiers[activeTierIndex + 1];
      nextTier = {
        requiredQty: upcoming.minQuantity,
        additionalPairs: upcoming.minQuantity - validQty,
        potentialUnitPrice: upcoming.unitPrice,
        potentialSavingsPerPair: unitPrice - upcoming.unitPrice,
      };
    }

    return {
      quantity: validQty,
      unitPrice,
      retailPrice,
      subtotal,
      retailTotal,
      totalSavings,
      savingsPercentage,
      profitMarginPercentage,
      activeTier,
      activeTierIndex,
      cartonsCount,
      isMoqMet,
      moq,
      currency: product.pricing.currency || "PKR",
      nextTier,
    };
  }, [product, quantity]);
}
