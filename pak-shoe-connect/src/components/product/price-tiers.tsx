import type { PriceTier } from "@/data/products";
import { formatPKR } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  tiers: PriceTier[];
  selectedQuantity: number;
};

export function PriceTiers({ tiers, selectedQuantity }: Props) {
  // Determine which tier is currently active based on selected quantity
  let activeTierIndex = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (selectedQuantity >= tiers[i].moq) {
      activeTierIndex = i;
    }
  }

  return (
    <div className="mt-6 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
        <span>Tiered Wholesale Volume Pricing</span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
          Multiples of 12 Pairs (1 Carton)
        </span>
      </div>
      <div className="flex border-y border-border divide-x divide-border rounded-xl overflow-hidden bg-card">
        {tiers.map((tier, idx) => {
          const isLast = idx === tiers.length - 1;
          const nextTier = tiers[idx + 1];
          const minPairs = Math.max(12, tier.moq);
          const minCtns = Math.max(1, Math.round(minPairs / 12));
          
          const maxPairs = nextTier ? nextTier.moq - 1 : undefined;
          const maxCtns = maxPairs ? Math.floor(maxPairs / 12) : undefined;
          
          const qtyString = isLast 
            ? `≥${minPairs} pairs (${minCtns}+ ctns)` 
            : `${minPairs}–${maxPairs} prs (${minCtns}–${maxCtns} ctns)`;

          const isActive = idx === activeTierIndex;

          return (
            <div 
              key={tier.moq} 
              className={cn(
                "flex-1 py-3 px-3 flex flex-col justify-center transition-colors duration-200",
                isActive ? "bg-primary/10 border-b-2 border-primary" : "bg-transparent"
              )}
            >
              <div className="text-[11px] font-bold uppercase text-muted-foreground">
                {tier.label}
              </div>
              <div className={cn(
                "font-display text-xl sm:text-2xl tracking-tight transition-colors duration-200 mt-0.5",
                isActive ? "text-primary font-bold" : "text-foreground"
              )}>
                {formatPKR(tier.pricePerPair)}
              </div>
              <div className={cn(
                "text-[11px] transition-colors duration-200 mt-1 font-mono",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {qtyString}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
