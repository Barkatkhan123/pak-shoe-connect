import React from "react";
import {
  Package,
  ShieldAlert,
  CheckCircle,
  Info,
  Layers,
  Palette,
  Hash,
  Sparkles,
} from "lucide-react";

interface MOQInfoCardProps {
  variant?: "full" | "short" | "compact" | "badge";
  className?: string;
}

export function MOQInfoCard({ variant = "short", className = "" }: MOQInfoCardProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <Package className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>MOQ: 12 pairs (1 carton) • Multiples of 12 only • 1 Sample Pair Available</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200 ${className}`}
      >
        <div className="flex items-center gap-2 font-bold mb-1">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Minimum Order Policy</span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          Bulk MOQ is 12 pairs (1 carton in multiples of 12). <strong>1 sample pair</strong> can
          also be ordered for quality inspection before bulk orders.
        </p>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={`rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">
                Wholesale Order & Packing Policy
              </h4>
              <p className="text-xs text-muted-foreground">
                Standardized factory packaging & order rules
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold font-mono">
            MOQ: 12 Pairs (1 Ctn)
          </span>
        </div>

        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground">
            <strong>Minimum Order Quantity (MOQ):</strong> 12 pairs (1 carton). Bulk orders must be
            placed in multiples of 12 pairs (12, 24, 36, 48, etc.). Each carton contains 12 pairs of
            a single color.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
            <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Minimum Order
              </span>
              <span className="text-xs font-semibold text-foreground">12 pairs (1 carton)</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
            <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Packing Specification
              </span>
              <span className="text-xs font-semibold text-foreground">12 pairs per carton</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
            <Hash className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Order Quantity Multiples
              </span>
              <span className="text-xs font-semibold text-foreground">
                Multiples of 12 pairs only
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/50">
            <Sparkles className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Sample Policy
              </span>
              <span className="text-xs font-semibold text-foreground">
                1 sample pair can also be ordered
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Short format default (ideal for product pages)
  return (
    <div className={`rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Package className="h-4 w-4" /> Wholesale Packing & MOQ Rules
        </span>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          Factory Standard
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground">Minimum Order:</span>
          <span className="font-bold text-foreground">12 pairs (1 carton)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground">Packing:</span>
          <span className="font-bold text-foreground">12 pairs per carton</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground">Order Quantity:</span>
          <span className="font-bold text-foreground">Multiples of 12 pairs</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground">Sample Order:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            1 sample pair can also be ordered
          </span>
        </div>
      </div>
    </div>
  );
}
