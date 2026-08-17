import type { ColorVariant } from "@/data/products";

type Props = {
  variants: ColorVariant[];
  selectedColor: string;
  onChange: (color: string) => void;
};

export function ColorSelector({ variants, selectedColor, onChange }: Props) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[15px] font-bold text-gray-900">Color</h4>
        <button className="text-[13px] font-semibold text-gray-900 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors">
          Select now
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {variants.map((v) => {
          const isSelected = selectedColor === v.name;
          return (
            <button
              key={v.name}
              type="button"
              disabled={!v.inStock}
              onClick={() => onChange(v.name)}
              className={`group relative flex h-[46px] w-[46px] items-center justify-center rounded-md border-2 transition-all duration-200 overflow-hidden ${
                isSelected ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
              } ${!v.inStock ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer"}`}
              title={!v.inStock ? `${v.name} (Out of Stock)` : v.name}
            >
              <div className="w-full h-full" style={{ backgroundColor: v.hex }} />
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 z-10 whitespace-nowrap">
                {v.name}
              </div>
            </button>
          );
        })}
      </div>
      {variants.some((v) => !v.inStock) && (
        <p className="text-xs text-gray-500 mt-2">Some colors are currently out of stock.</p>
      )}
    </div>
  );
}
