import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { formatPKR } from "@/lib/site";
import { Minus, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeQuantityMatrixProps {
  product: Product;
  selectedColor: string;
  onSelectionChange: (totals: { totalPairs: number; totalAmount: number; quantities: Record<string, number> }) => void;
}

export function SizeQuantityMatrix({ product, selectedColor, onSelectionChange }: SizeQuantityMatrixProps) {
  // quantities maps size -> selected quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const colorVariant = product.colorVariants.find(c => c.name === selectedColor) || product.colorVariants[0];
  const stockPerSize = colorVariant ? Math.floor(colorVariant.stockUnits / product.sizes.length) : 0; // Simplified logic since stock is per color in current schema

  const totalPairs = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);

  // Calculate current price per pair based on tiers
  let currentPricePerPair = product.priceTiers[0].pricePerPair;
  for (let i = 0; i < product.priceTiers.length; i++) {
    if (totalPairs >= product.priceTiers[i].moq) {
      currentPricePerPair = product.priceTiers[i].pricePerPair;
    }
  }

  const totalAmount = totalPairs * currentPricePerPair;

  useEffect(() => {
    onSelectionChange({ totalPairs, totalAmount, quantities });
  }, [quantities, totalPairs, totalAmount, onSelectionChange]);

  const updateQuantity = (size: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + delta);
      if (next > stockPerSize) return prev; // Cannot exceed stock
      
      const newQuantities = { ...prev };
      if (next === 0) {
        delete newQuantities[size];
      } else {
        newQuantities[size] = next;
      }
      return newQuantities;
    });
  };

  const moqMet = totalPairs >= product.moq;
  const isMultipleOf12 = totalPairs > 0 && totalPairs % 12 === 0;

  const handleFillStandardCarton = () => {
    // Standard ratio distribution for 12 pairs (1 carton) across available sizes
    const numSizes = product.sizes.length;
    const basePerSize = Math.floor(12 / numSizes);
    const remainder = 12 % numSizes;

    const newQuantities: Record<string, number> = {};
    product.sizes.forEach((size, idx) => {
      newQuantities[size] = basePerSize + (idx < remainder ? 1 : 0);
    });
    setQuantities(newQuantities);
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-foreground">Select Size & Quantity</h3>
        <button
          type="button"
          onClick={handleFillStandardCarton}
          className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Auto-Fill 1 Carton (12 Pairs Ratio)
        </button>
      </div>

      <div className="mb-3 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
        📌 <strong>Packing Rule:</strong> Each carton contains 12 pairs of single color (<strong>{selectedColor}</strong>). Orders must be in multiples of 12 pairs.
      </div>
      
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 bg-muted/40 p-4 border-b border-border text-sm text-muted-foreground font-medium">
          <div className="col-span-3">Size</div>
          <div className="col-span-3 text-center">Available Stock</div>
          <div className="col-span-3 text-center">Unit Price</div>
          <div className="col-span-3 text-right">Quantity</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {product.sizes.map((size) => {
            const qty = quantities[size] || 0;
            return (
              <div key={size} className="grid grid-cols-2 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors">
                <div className="font-medium text-foreground sm:col-span-3 flex items-center gap-1.5">
                  <span className="font-bold">Size {size}</span>
                  <span className="text-[11px] text-muted-foreground">(EU {parseInt(size, 10) >= 36 ? size : (parseInt(size, 10) || 8) + 33})</span>
                </div>
                <div className="text-sm text-muted-foreground sm:col-span-3 sm:text-center">
                  {stockPerSize} pairs
                </div>
                <div className="hidden sm:block text-sm text-foreground sm:col-span-3 text-center">
                  {formatPKR(currentPricePerPair)}
                </div>
                
                {/* Stepper */}
                <div className="flex items-center justify-end sm:col-span-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
                    <button 
                      onClick={() => updateQuantity(size, -1)}
                      disabled={qty === 0}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-12 text-center text-sm font-medium">
                      {qty}
                    </div>
                    <button 
                      onClick={() => updateQuantity(size, 1)}
                      disabled={qty >= stockPerSize}
                      className="p-2 hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Footer */}
        <div className="bg-muted/20 p-4 sm:p-5 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1 text-sm">
            {moqMet && isMultipleOf12 ? (
              <div className="flex items-center gap-1 text-emerald font-medium">
                <Check className="w-4 h-4" />
                <span>Valid Order ({totalPairs / 12} Carton{totalPairs === 12 ? "" : "s"} - {totalPairs} Pairs)</span>
              </div>
            ) : moqMet && !isMultipleOf12 ? (
              <div className="text-amber-600 font-medium">
                ⚠️ Order total ({totalPairs} pairs) must be in multiples of 12. Add {12 - (totalPairs % 12)} more pair(s).
              </div>
            ) : (
              <div className="text-leather-deep">
                Needs {product.moq - totalPairs} more pairs to meet MOQ (12 pairs / 1 carton)
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Pairs</div>
              <div className="font-medium text-lg text-foreground">{totalPairs}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="font-display text-2xl text-primary">{formatPKR(totalAmount)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
