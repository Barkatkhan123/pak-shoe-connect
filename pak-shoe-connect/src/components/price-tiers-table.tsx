import type { PriceTier } from "@/data/products";
import { formatPKR } from "@/lib/site";
import { Info } from "lucide-react";

type Props = {
  tiers: PriceTier[];
};

export function PriceTiersTable({ tiers }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Wholesale Pricing
        </h4>
        <div title="Pricing scales with volume. GST not included." className="cursor-help text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
        </div>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Quantity (Pairs)</th>
              <th className="px-4 py-2 font-medium">Price / Pair</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tiers.map((t, i) => {
              const isBest = i === tiers.length - 1;
              return (
                <tr key={t.moq} className={`transition-colors hover:bg-muted/30 ${isBest ? "tier-best font-medium" : ""}`}>
                  <td className="px-4 py-3">
                    {t.moq}{isBest ? "+" : ` - ${tiers[i+1]?.moq - 1}`}
                  </td>
                  <td className={`px-4 py-3 ${isBest ? "text-emerald-deep font-bold" : ""}`}>
                    {formatPKR(t.pricePerPair)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      isBest ? "bg-emerald-deep text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {t.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
