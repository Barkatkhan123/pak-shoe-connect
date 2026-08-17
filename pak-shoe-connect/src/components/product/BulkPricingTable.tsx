import { Check, Star, ArrowUpRight } from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";
import type { PricingCalculation } from "@/hooks/usePricingCalculator";

interface BulkPricingTableProps {
  product: EnterpriseProduct;
  pricing: PricingCalculation;
  onSelectTierQuantity: (qty: number) => void;
}

export function BulkPricingTable({
  product,
  pricing,
  onSelectTierQuantity,
}: BulkPricingTableProps) {
  const { bulkPricing } = product;
  const { activeTierIndex, currency, nextTier } = pricing;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Tiered Wholesale Volume Pricing
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Multiples of 12 Pairs (1 Carton)
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Minimum selectable quantity is 12 pairs (1 carton). Increments by 12 pairs per carton.
        </p>
      </div>

      {/* Grid of Price Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {bulkPricing.map((tier, idx) => {
          const isActive = idx === activeTierIndex;
          const minPairs = Math.max(12, Math.ceil(tier.minQuantity / 12) * 12);
          const minCartons = Math.max(1, Math.round(minPairs / 12));

          const maxPairs = tier.maxQuantity ? Math.floor(tier.maxQuantity / 12) * 12 : undefined;
          const maxCartons = maxPairs ? Math.round(maxPairs / 12) : undefined;

          const rangeLabel = maxPairs ? `${minPairs}–${maxPairs} prs` : `${minPairs}+ prs`;

          const cartonLabel = maxCartons
            ? `(${minCartons}–${maxCartons} ctn${maxCartons > 1 ? "s" : ""})`
            : `(${minCartons}+ ctn${minCartons > 1 ? "s" : ""})`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectTierQuantity(minPairs)}
              className={`relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-amber-500 bg-amber-500/10 shadow-sm ring-2 ring-amber-500/40"
                  : "border-border/60 bg-secondary/30 hover:border-border hover:bg-secondary/70"
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute -top-2 right-2 flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-black shadow">
                  <Star className="h-2.5 w-2.5 fill-current" /> Active
                </div>
              )}

              <div>
                <span className="block text-[11px] font-bold text-muted-foreground uppercase">
                  {tier.label}
                </span>
                <span className="block text-xs font-bold text-foreground mt-0.5">{rangeLabel}</span>
                <span className="block text-[10px] text-muted-foreground font-mono">
                  {cartonLabel}
                </span>
              </div>

              <div className="mt-2 pt-1.5 border-t border-border/40">
                <span className="block text-sm font-extrabold text-foreground">
                  {currency} {tier.unitPrice.toLocaleString()}
                </span>
                <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Save {tier.savingsPct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Upsell helper message if close to next tier */}
      {nextTier && nextTier.additionalPairs > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300 border border-amber-500/20">
          <span>
            💡 Add{" "}
            <strong>
              {Math.ceil(nextTier.additionalPairs / 12) * 12} more pairs (
              {Math.ceil(nextTier.additionalPairs / 12)} carton)
            </strong>{" "}
            to unlock{" "}
            <strong>
              {currency} {nextTier.potentialUnitPrice.toLocaleString()}/pair
            </strong>{" "}
            (save an extra {currency} {nextTier.potentialSavingsPerPair.toLocaleString()} per pair).
          </span>
          <button
            onClick={() => onSelectTierQuantity(Math.ceil(nextTier.requiredQty / 12) * 12)}
            className="ml-2 shrink-0 font-bold underline hover:opacity-80 flex items-center gap-0.5"
          >
            Upgrade <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
