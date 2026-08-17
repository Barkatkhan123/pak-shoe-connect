import { Check, X, AlertCircle } from "lucide-react";
import type { VariantSize } from "@/types/product";

interface SizeMatrixProps {
  sizes: VariantSize[];
  selectedSize: string;
  onSelectSize: (sizeEU: string) => void;
  isAssortedRatio?: boolean;
  onToggleAssorted?: (isAssorted: boolean) => void;
}

export function SizeMatrix({
  sizes,
  selectedSize,
  onSelectSize,
  isAssortedRatio = true,
  onToggleAssorted,
}: SizeMatrixProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* ── Header with B2B Assorted Carton Option ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Size Run Matrix (6–12)
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">(PK/UK • EU • US)</span>
        </div>

        {onToggleAssorted && (
          <button
            type="button"
            onClick={() => onToggleAssorted(!isAssortedRatio)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
              isAssortedRatio
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAssortedRatio ? "✓ Standard Assorted Carton Ratio" : "Custom Size Select"}
          </button>
        )}
      </div>

      {/* ── Size Grid Table ── */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {sizes.map((s) => {
          const isSelected = (selectedSize === s.EU || selectedSize === s.UK) && !isAssortedRatio;
          const isOut = s.status === "out" || s.stock === 0;
          const isLow = s.status === "low";

          return (
            <button
              key={s.EU}
              type="button"
              disabled={isOut}
              onClick={() => {
                if (onToggleAssorted) onToggleAssorted(false);
                onSelectSize(s.UK || s.EU);
              }}
              className={`relative flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                isOut
                  ? "border-border/40 bg-secondary/20 opacity-40 cursor-not-allowed"
                  : isSelected
                    ? "border-foreground bg-foreground text-background shadow-md ring-2 ring-foreground/20"
                    : "border-border/70 bg-secondary/30 hover:border-border hover:bg-secondary/70 text-foreground"
              }`}
            >
              {/* Primary Size */}
              <span className="text-sm font-black tracking-tight">Size {s.UK || s.EU}</span>

              {/* Subtext EU / US */}
              <span
                className={`text-[10px] ${
                  isSelected ? "text-background/80" : "text-muted-foreground"
                }`}
              >
                EU {s.EU} • US {s.US}
              </span>

              {/* Status Badge */}
              <div className="mt-1 flex items-center gap-1">
                {isOut ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500">
                    <X className="h-2.5 w-2.5" /> Out
                  </span>
                ) : isLow ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-2.5 w-2.5" /> Low ({s.stock})
                  </span>
                ) : (
                  <span
                    className={`flex items-center gap-0.5 text-[9px] font-semibold ${
                      isSelected ? "text-emerald-300" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" /> {s.stock}+
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Assorted Carton breakdown hint */}
      {isAssortedRatio && (
        <div className="rounded-xl bg-secondary/40 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between border border-border/40">
          <span>
            📦 <strong>Standard B2B Wholesale Carton Breakdown (12 Pairs):</strong> Size 6 (1), 7
            (2), 8 (3), 9 (3), 10 (2), 11 (1).
          </span>
        </div>
      )}
    </div>
  );
}
