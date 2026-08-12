import { Product } from "@/data/products";

interface SpecTableProps {
  product: Product;
}

export function SpecTable({ product }: SpecTableProps) {
  // Combine core attributes with generic specifications
  const specs = [
    { label: "Minimum Order", value: "12 pairs (1 carton) — Multiples of 12 pairs only" },
    { label: "Packing", value: "12 pairs per carton (Single color per carton)" },
    { label: "Material", value: product.material },
    { label: "Sole", value: product.soleType },
    { label: "Gender", value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) },
    { label: "Lead time", value: product.leadTimeDays },
    { label: "Customization", value: product.customization.join(", ") || "OEM/ODM" },
    { 
      label: "Place of origin", 
      value: <span className="text-emerald font-medium">Lahore, PK</span> 
    },
    ...Object.entries(product.specifications).map(([key, value]) => ({
      label: key,
      value
    }))
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="grid grid-cols-1 divide-y divide-border">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className={`flex items-center p-4 text-sm ${index % 2 === 0 ? 'bg-muted/40' : 'bg-background'}`}
          >
            <div className="w-1/3 text-muted-foreground">{spec.label}</div>
            <div className="w-2/3 text-foreground">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
