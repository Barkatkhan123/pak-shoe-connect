import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { VariantColor } from "@/types/product";

interface VariantSelectorProps {
  colors: VariantColor[];
  selectedColor: string;
  onSelectColor: (colorName: string, image?: string) => void;
}

export function VariantSelector({
  colors,
  selectedColor,
  onSelectColor,
}: VariantSelectorProps) {
  const active = colors.find((c) => c.name === selectedColor) || colors[0];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Color: <span className="text-foreground capitalize">{active?.name}</span>
        </span>
        {active && (
          <span className="text-[11px] text-muted-foreground">
            {active.stockUnits.toLocaleString()} pairs ready in stock
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map((c) => {
          const isSelected = c.name === selectedColor;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onSelectColor(c.name, c.image)}
              title={`${c.name} (${c.stockUnits} in stock)`}
              className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all ${
                isSelected
                  ? "border-foreground bg-secondary font-bold text-foreground shadow-sm ring-2 ring-foreground/20"
                  : "border-border/70 bg-secondary/30 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {/* Color Swatch Circle */}
              <span
                className="h-4 w-4 rounded-full border border-black/20 shadow-inner flex items-center justify-center shrink-0"
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check
                    className={`h-2.5 w-2.5 ${
                      c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#fff"
                        ? "text-black"
                        : "text-white"
                    }`}
                  />
                )}
              </span>

              <span className="text-xs">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
