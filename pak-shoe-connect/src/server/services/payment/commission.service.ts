export type SupplierTier = "FREE_STARTER" | "SILVER_MANUFACTURER" | "GOLD_FACTORY";

export interface CommissionCalculationInput {
  orderAmount: number;
  supplierTier: SupplierTier | string;
  monthlyGMV?: number;
  isExportOrder?: boolean;
}

export interface CommissionCalculationResult {
  orderAmount: number;
  supplierTier: string;
  baseRatePercent: number;
  volumeDiscountPercent: number;
  effectiveRatePercent: number;
  platformFee: number;
  supplierPayout: number;
}

export class CommissionService {
  /**
   * Calculates marketplace commission and supplier net proceeds
   */
  static calculateCommission(input: CommissionCalculationInput): CommissionCalculationResult {
    const tier = (input.supplierTier || "FREE_STARTER").toUpperCase() as SupplierTier;
    const orderAmount = input.orderAmount;
    const monthlyGMV = input.monthlyGMV || 0;

    // 1. Base rate by tier
    let baseRate = 5.0; // FREE_STARTER default

    if (tier === "GOLD_FACTORY") {
      baseRate = 3.0;
    } else if (tier === "SILVER_MANUFACTURER") {
      baseRate = 4.0;
    }

    // 2. High-volume discount (> PKR 5M / month)
    let volumeDiscount = 0;
    if (monthlyGMV >= 5_000_000) {
      volumeDiscount = 0.5;
    }

    // 3. Export incentive (if applicable)
    if (input.isExportOrder) {
      volumeDiscount += 0.25;
    }

    const effectiveRate = Math.max(1.5, baseRate - volumeDiscount);
    const platformFee = Math.round((orderAmount * effectiveRate) / 100);
    const supplierPayout = orderAmount - platformFee;

    return {
      orderAmount,
      supplierTier: tier,
      baseRatePercent: baseRate,
      volumeDiscountPercent: volumeDiscount,
      effectiveRatePercent: effectiveRate,
      platformFee,
      supplierPayout,
    };
  }
}
