/**
 * Dynamic Wholesale Pricing Engine
 * Encapsulates the B2B rules for tier discounts, bulk order calculations, and category margins.
 */

export interface PricingTier {
  minQty: number;
  discountPercentage: number;
}

// Global B2B volume discount rules
const GLOBAL_TIERS: PricingTier[] = [
  { minQty: 1000, discountPercentage: 25 },
  { minQty: 500, discountPercentage: 15 },
  { minQty: 100, discountPercentage: 8 },
  { minQty: 0, discountPercentage: 0 },
];

export interface ProductPricingRules {
  basePricePKR: number;
  moq: number;
  customTiers?: PricingTier[];
}

export class WholesalePricingEngine {
  private rules: ProductPricingRules;

  constructor(rules: ProductPricingRules) {
    this.rules = rules;
  }

  /**
   * Determine the applicable discount tier based on volume.
   */
  public getApplicableTier(quantity: number): PricingTier {
    if (quantity < this.rules.moq) {
      throw new Error(`Quantity ${quantity} is below the MOQ of ${this.rules.moq}`);
    }

    const tiersToUse = this.rules.customTiers || GLOBAL_TIERS;
    // Tiers should be evaluated in descending order of minQty
    const sortedTiers = [...tiersToUse].sort((a, b) => b.minQty - a.minQty);

    for (const tier of sortedTiers) {
      if (quantity >= tier.minQty) {
        return tier;
      }
    }
    return { minQty: 0, discountPercentage: 0 };
  }

  /**
   * Calculate exact pricing details for a given volume.
   */
  public calculateQuote(quantity: number) {
    const tier = this.getApplicableTier(quantity);
    const unitPrice =
      Math.round(this.rules.basePricePKR * (1 - tier.discountPercentage / 100) * 100) / 100;
    const totalCost = Math.round(unitPrice * quantity * 100) / 100;
    const baseTotal = this.rules.basePricePKR * quantity;

    return {
      quantity,
      baseUnitPrice: this.rules.basePricePKR,
      finalUnitPrice: unitPrice,
      totalCost,
      discountAppliedPercentage: tier.discountPercentage,
      totalSavings: Math.round((baseTotal - totalCost) * 100) / 100,
    };
  }

  /**
   * Generate UI-friendly tier intervals for the calculator.
   */
  public generateCalculatorTiers() {
    const tiersToUse = this.rules.customTiers || GLOBAL_TIERS;
    const sortedTiers = [...tiersToUse].sort((a, b) => a.minQty - b.minQty);

    // Ensure MOQ is the first tier if it doesn't align exactly
    const displayTiers = [];
    if (!sortedTiers.some((t) => t.minQty === this.rules.moq)) {
      displayTiers.push({ threshold: this.rules.moq, label: `${this.rules.moq} Pairs` });
    }

    for (const tier of sortedTiers) {
      if (tier.minQty > 0 && tier.minQty >= this.rules.moq) {
        displayTiers.push({ threshold: tier.minQty, label: `${tier.minQty} Pairs` });
      }
    }

    return displayTiers;
  }
}
