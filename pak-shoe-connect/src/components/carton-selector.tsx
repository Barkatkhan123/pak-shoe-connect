import React from "react";
import { Package, Plus, Minus, TrendingDown, Truck } from "lucide-react";
import { formatPKR } from "@/lib/site";

interface CartonSelectorProps {
  cartonCount: number;
  pairsPerCarton?: number;
  onCartonChange: (count: number) => void;
  basePrice?: number;
}

export function CartonSelector({
  cartonCount,
  pairsPerCarton = 12,
  onCartonChange,
  basePrice = 1450,
}: CartonSelectorProps) {
  const totalPairs = cartonCount * pairsPerCarton;

  // Tier calculation
  let activeTier = "Standard Bulk";
  let unitPrice = 1850;
  let savings = 0;

  if (totalPairs >= 600) {
    activeTier = "Bulk Master Tier";
    unitPrice = 1250;
    savings = 600 * totalPairs;
  } else if (totalPairs >= 240) {
    activeTier = "Wholesale Volume";
    unitPrice = 1450;
    savings = 400 * totalPairs;
  } else if (totalPairs >= 60) {
    activeTier = "Dealer Tier";
    unitPrice = 1650;
    savings = 200 * totalPairs;
  }

  const subtotal = unitPrice * totalPairs;
  const estimatedFreight = cartonCount * 450;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Wholesale Master Carton Stepper
          </span>
          <div className="text-lg font-bold font-display text-foreground flex items-center gap-2 mt-0.5">
            <Package className="h-5 w-5 text-primary" />
            {cartonCount} Master {cartonCount === 1 ? "Carton" : "Cartons"} ({totalPairs} Pairs)
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-3 py-1 text-xs font-bold font-mono">
          {activeTier}
        </span>
      </div>

      {/* MOQ Note */}
      <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5 text-xs text-primary font-medium flex items-center gap-2">
        <Package className="h-4 w-4 shrink-0" />
        <span>Each carton contains 12 pairs of a single color. Order quantity must be in multiples of 12.</span>
      </div>

      {/* Stepper controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onCartonChange(Math.max(1, cartonCount - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground font-bold transition cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex-1 rounded-lg border border-border bg-background py-2 text-center">
          <span className="font-mono text-xl font-bold text-foreground">{cartonCount}</span>
          <span className="text-xs text-muted-foreground ml-2">carton{cartonCount > 1 ? "s" : ""} (@ 12 pairs/ctn)</span>
        </div>

        <button
          type="button"
          onClick={() => onCartonChange(cartonCount + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground font-bold transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Quick Bulk Presets */}
        <div className="hidden sm:flex items-center gap-1.5">
          {[1, 2, 5, 10, 20].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onCartonChange(preset)}
              className={`rounded-lg px-2.5 py-2 text-xs font-bold transition cursor-pointer ${
                cartonCount === preset
                  ? "bg-foreground text-background"
                  : "border border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              {preset} Ctn{preset > 1 ? "s" : ""} ({preset * 12}p)
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Unit Wholesale Rate:</span>
          <span className="font-bold font-mono text-foreground">PKR {unitPrice.toLocaleString()} / pair</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal ({totalPairs} pairs):</span>
          <span className="font-bold font-mono text-foreground">{formatPKR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-primary" /> Est. B2B Freight (Karachi Hub):
          </span>
          <span className="font-bold font-mono text-foreground">{formatPKR(estimatedFreight)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between pt-1 border-t border-border/50 text-emerald-600 font-bold">
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" /> Bulk Volume Savings:
            </span>
            <span className="font-mono">Save {formatPKR(savings)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
