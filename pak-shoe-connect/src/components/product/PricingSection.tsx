import { TrendingUp, Sparkles, Percent, Tag } from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";
import type { PricingCalculation } from "@/hooks/usePricingCalculator";

interface PricingSectionProps {
  product: EnterpriseProduct;
  pricing: PricingCalculation;
}

export function PricingSection({ product, pricing }: PricingSectionProps) {
  const { unitPrice, retailPrice, savingsPercentage, profitMarginPercentage, currency } = pricing;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 border border-amber-500/20">
      {/* ── Main Price Row ── */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {currency} {unitPrice.toLocaleString()}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            / pair
          </span>
          <span className="text-sm font-medium text-muted-foreground line-through decoration-rose-500/70 decoration-2">
            {currency} {retailPrice.toLocaleString()}
          </span>
        </div>

        {/* Dynamic Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
            <Tag className="h-3 w-3" />
            SAVE {savingsPercentage}%
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
            <TrendingUp className="h-3 w-3" />
            +{profitMarginPercentage}% Retail Margin
          </span>
        </div>
      </div>

      {/* MOQ & Carton Quick Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-amber-500/15">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground">MOQ:</span> 12 pairs (1 carton) • Multiples of 12 only
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Volume discount auto-applied
        </div>
      </div>
    </div>
  );
}
