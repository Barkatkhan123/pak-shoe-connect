import { Plus, Minus, Package, Sparkles, AlertCircle } from "lucide-react";
import type { PricingCalculation } from "@/hooks/usePricingCalculator";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  pricing: PricingCalculation;
}

export function QuantitySelector({ quantity, onQuantityChange, pricing }: QuantitySelectorProps) {
  const { moq, cartonsCount, subtotal, unitPrice, currency, isMoqMet } = pricing;
  const cartonStep = 12;

  const handleDecrease = () => {
    onQuantityChange(Math.max(moq, quantity - cartonStep));
  };

  const handleIncrease = () => {
    onQuantityChange(quantity + cartonStep);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onQuantityChange(val);
    }
  };

  const isMultipleOf12 = quantity > 0 && quantity % 12 === 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-secondary/30 p-4">
      {/* Product Page MOQ Short Format Summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between font-bold text-primary border-b border-primary/10 pb-1.5">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Package className="h-4 w-4" /> Wholesale Packing Specifications
          </span>
          <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded font-mono">
            1 Carton = 12 Pairs
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <div>
            <strong className="text-foreground">Minimum Order:</strong> 12 pairs (1 carton)
          </div>
          <div>
            <strong className="text-foreground">Packing:</strong> 12 pairs per carton
          </div>
          <div>
            <strong className="text-foreground">Order Quantity:</strong> Multiples of 12 pairs only
          </div>
          <div>
            <strong className="text-foreground">Color:</strong> Single color per carton (all 12
            pairs same color)
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Order Quantity (Pairs)
          </span>
          <span className="text-[11px] text-muted-foreground">
            MOQ: {moq} pairs • Approx. {cartonsCount} master carton(s)
          </span>
        </div>

        {/* Stepper Input */}
        <div className="flex items-center rounded-xl border border-border/80 bg-white dark:bg-neutral-900 shadow-sm">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= moq}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Minus className="h-4 w-4" />
          </button>

          <input
            type="number"
            min={moq}
            step={cartonStep}
            value={quantity}
            onChange={handleInputChange}
            className="h-10 w-20 text-center font-mono text-base font-extrabold text-foreground bg-transparent focus:outline-none"
          />

          <button
            type="button"
            onClick={handleIncrease}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carton Quick-Select Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground">Quick Select:</span>
        {[1, 2, 3, 4, 5, 10].map((num) => {
          const pairs = num * cartonStep;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onQuantityChange(pairs)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                quantity === pairs
                  ? "bg-foreground text-background font-bold shadow-sm"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {num} Ctn{num > 1 ? "s" : ""} ({pairs} prs)
            </button>
          );
        })}
      </div>

      {/* Multiples of 12 / MOQ Warning if applicable */}
      {(!isMoqMet || !isMultipleOf12) && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive font-medium border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {!isMoqMet
              ? `Minimum Order Quantity is ${moq} pairs (1 carton).`
              : "Orders must be placed in multiples of 12 pairs (12, 24, 36, 48, etc.)."}
          </span>
        </div>
      )}

      {/* Live Subtotal Summary Strip */}
      <div className="flex items-center justify-between rounded-xl bg-white dark:bg-neutral-900/80 p-3 shadow-sm border border-border/60">
        <div>
          <span className="block text-[11px] text-muted-foreground">
            Estimated Wholesale Subtotal
          </span>
          <span className="text-base md:text-lg font-black text-foreground">
            {currency} {subtotal.toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-[11px] text-muted-foreground">Applied Unit Rate</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {currency} {unitPrice.toLocaleString()} / pair
          </span>
        </div>
      </div>
    </div>
  );
}
