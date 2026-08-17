import { Package } from "lucide-react";
import type { PriceTier } from "@/data/products";

interface ProductPricingProps {
  tiers: PriceTier[];
  moq: number;
  samplePrice?: number;
}

export function ProductPricing({ tiers, samplePrice }: ProductPricingProps) {
  return (
    <div className="flex flex-col mb-6 mt-4">
      <div className="mb-3">
        <span className="bg-[#E52F2F] text-white text-xs font-bold px-2 py-0.5 rounded-sm">
          Lower priced than similar
        </span>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {tiers.map((tier, i) => {
          const nextTier = tiers[i + 1];
          const range = nextTier ? `${tier.moq}-${nextTier.moq - 1} pairs` : `≥${tier.moq} pairs`;

          return (
            <div key={i} className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-sm font-bold text-gray-900 mr-0.5">PKR</span>
                <span className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("en-US").format(tier.pricePerPair)}
                </span>
              </div>
              <span className="text-sm text-gray-500 mt-1">{range}</span>
            </div>
          );
        })}
      </div>

      {samplePrice && (
        <div className="mt-6 flex items-center justify-between border-y border-gray-100 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Package className="w-4 h-4 text-gray-400" />
            <span>Sample price:</span>
            <span className="font-semibold text-gray-900">
              PKR {new Intl.NumberFormat("en-US").format(samplePrice)}
            </span>
          </div>
          <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors">
            Get sample
          </button>
        </div>
      )}
    </div>
  );
}
