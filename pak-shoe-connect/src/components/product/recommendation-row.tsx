import { Product } from "@/data/products";
import { ProductCard } from "@/components/product-card";

interface RecommendationRowProps {
  title: string;
  products: Product[];
}

export function RecommendationRow({ title, products }: RecommendationRowProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 w-full mt-12 mb-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product.slug} className="shrink-0 w-[280px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
