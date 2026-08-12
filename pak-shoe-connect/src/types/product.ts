import type { Product as LegacyProduct, Review as LegacyReview, PriceTier as LegacyPriceTier } from "@/data/products";

export interface SupplierInfo {
  name: string;
  verified: boolean;
  rating: number;
  location: string;
  responseRate: number; // e.g. 98%
  replyTime: string; // e.g. "< 2 Hours"
  establishedYear?: number;
  productionCapacity: string; // e.g. "50,000 pairs/month"
  qualityStandard: string; // e.g. "ISO 9001:2015 & CE Certified"
  factoryImages?: string[];
  factoryVideo?: string;
  exportMarkets?: string[];
}

export interface ProductVideo {
  url: string;
  thumbnail: string;
  title: string;
  duration: string;
  type: "demo" | "factory" | "customer" | "process";
}

export interface BulkPricingTier {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  label: string;
  savingsPct: number;
}

export interface VariantColor {
  name: string;
  hex: string;
  inStock: boolean;
  stockUnits: number;
  image?: string;
}

export interface VariantSize {
  EU: string;
  UK: string;
  US: string;
  stock: number;
  status: "available" | "low" | "out";
}

export interface ProductSpecifications {
  upperMaterial: string;
  soleMaterial: string;
  insole: string;
  lining?: string;
  closure?: string;
  toeStyle?: string;
  origin: string;
  weight: string;
  packaging: string;
  leadTime: string;
  standard?: string;
  [key: string]: string | undefined;
}

export interface EnterpriseProduct {
  id: string;
  slug: string;
  title: string;
  name: string;
  nameUrdu?: string;
  sku: string;
  brand: string;
  categorySlug: string;
  categoryName?: string;
  supplier: SupplierInfo;
  media: {
    images: string[];
    mainImage: string;
    videos: ProductVideo[];
  };
  pricing: {
    basePrice: number;
    retailPrice: number;
    currency: string;
    discount: number; // %
    profitMargin: number; // %
  };
  bulkPricing: BulkPricingTier[];
  variants: {
    colors: VariantColor[];
    sizes: VariantSize[];
  };
  inventory: {
    SKU: string;
    stock: number;
    moq: number;
    cartonQty: number;
    inStock: boolean;
  };
  specifications: ProductSpecifications;
  description: string;
  sellingPoints: string[];
  shipping: {
    dispatchDays: string;
    cartonInfo: string;
    estimatedCostPKR: number;
    returnPolicy: string;
    modes: string[];
  };
  reviews: LegacyReview[];
  stats: {
    rating: number;
    totalReviews: number;
    fiveStarPct: number;
    fourStarPct: number;
    threeStarPct: number;
    twoStarPct: number;
    oneStarPct: number;
    unitsSold: number;
    ordersCompleted: number;
    repeatPurchasePct: number;
  };
}

/**
 * Normalizer that upgrades any standard `Product` to the full `EnterpriseProduct`
 * model with realistic B2B marketplace intelligence, multi-video support, and factory credentials.
 */
export function normalizeEnterpriseProduct(product: LegacyProduct): EnterpriseProduct {
  const basePrice = product.priceTiers?.[0]?.pricePerPair || 1850;
  const retailPrice = Math.round(basePrice * 1.55);
  const discount = Math.round(((retailPrice - basePrice) / retailPrice) * 100);
  const profitMargin = Math.round(((retailPrice - basePrice) / basePrice) * 100);

  // Generate multi-video suite
  const defaultVideoUrl = product.video || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  const videos: ProductVideo[] = [
    {
      url: defaultVideoUrl,
      thumbnail: product.image,
      title: `${product.name} — 360° Studio Showcase`,
      duration: "01:15",
      type: "demo",
    },
    {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      thumbnail: product.images?.[1] || product.image,
      title: "Lahore Manufacturing Facility & Automated Stitching Line",
      duration: "02:40",
      type: "factory",
    },
    {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail: product.images?.[2] || product.image,
      title: "Wholesale Retailer Unboxing & Quality Inspection",
      duration: "00:54",
      type: "customer",
    },
  ];

  // Bulk pricing calculations
  const bulkPricing: BulkPricingTier[] = (product.priceTiers && product.priceTiers.length > 0)
    ? product.priceTiers.map((tier, idx, arr) => {
        const nextTier = arr[idx + 1];
        const maxQty = nextTier ? nextTier.moq - 1 : undefined;
        const tierSavings = Math.round(((retailPrice - tier.pricePerPair) / retailPrice) * 100);
        return {
          minQuantity: tier.moq,
          maxQuantity: maxQty,
          unitPrice: tier.pricePerPair,
          label: tier.label || `${tier.moq}+ pairs`,
          savingsPct: tierSavings,
        };
      })
    : [
        { minQuantity: product.moq || 12, maxQuantity: 49, unitPrice: basePrice, label: "Starter", savingsPct: discount },
        { minQuantity: 50, maxQuantity: 199, unitPrice: Math.round(basePrice * 0.9), label: "Dealer", savingsPct: discount + 10 },
        { minQuantity: 200, unitPrice: Math.round(basePrice * 0.8), label: "Wholesale", savingsPct: discount + 20 },
      ];

  // Sizes with stock intelligence (Sizes 6 to 12)
  const sizes: VariantSize[] = (product.sizes && product.sizes.length > 0)
    ? product.sizes.map((sz, i) => {
        const szNum = parseInt(sz, 10) || (6 + i);
        let uk = "";
        let us = "";
        let eu = "";
        if (szNum >= 36 && szNum <= 48) {
          eu = `${szNum}`;
          uk = `${szNum - 33}`;
          us = `${szNum - 32}`;
        } else {
          uk = `${szNum}`;
          us = `${szNum + 1}`;
          eu = `${szNum + 33}`;
        }
        const stockUnits = (i % 5 === 3) ? 0 : (i % 4 === 2) ? 8 : 120 + i * 40;
        const status: "low" | "available" | "out" = stockUnits === 0 ? "out" : stockUnits < 15 ? "low" : "available";
        return { EU: eu, UK: uk, US: us, stock: stockUnits, status };
      })
    : [
        { EU: "39", UK: "6", US: "7", stock: 150, status: "available" },
        { EU: "40", UK: "7", US: "8", stock: 240, status: "available" },
        { EU: "41", UK: "8", US: "9", stock: 12, status: "low" },
        { EU: "42", UK: "9", US: "10", stock: 310, status: "available" },
        { EU: "43", UK: "10", US: "11", stock: 180, status: "available" },
        { EU: "44", UK: "11", US: "12", stock: 95, status: "available" },
        { EU: "45", UK: "12", US: "13", stock: 0, status: "out" },
      ];

  // Ratings calculation
  const reviews = product.reviews || [];
  const totalReviews = reviews.length || 24;
  const ratingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length > 0 ? Number((ratingSum / reviews.length).toFixed(1)) : 4.8;

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length || 20;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length || 3;
  const threeStarCount = reviews.filter((r) => r.rating === 3).length || 1;

  const fiveStarPct = Math.round((fiveStarCount / (totalReviews || 1)) * 100);
  const fourStarPct = Math.round((fourStarCount / (totalReviews || 1)) * 100);
  const threeStarPct = Math.round((threeStarCount / (totalReviews || 1)) * 100);

  const allImages = (product.images && product.images.length > 0) ? product.images : [product.image];

  return {
    id: product.slug,
    slug: product.slug,
    title: product.name,
    name: product.name,
    nameUrdu: product.nameUrdu,
    sku: product.sku || `SKU-${product.slug.toUpperCase().slice(0, 10)}`,
    brand: "SherSha Certified Manufacturing Hub",
    categorySlug: product.categorySlug,
    supplier: {
      name: "Sialkot & Lahore Master Footwear Syndicate",
      verified: true,
      rating: 4.9,
      location: "Industrial Estate, Lahore & Sialkot, Pakistan",
      responseRate: 99,
      replyTime: "< 1.5 Hours",
      establishedYear: 2012,
      productionCapacity: product.productionCapacity || "45,000 pairs / month",
      qualityStandard: "ISO 9001:2015 & SATRA Footwear Approved",
      factoryImages: allImages,
      factoryVideo: videos[1].url,
      exportMarkets: ["Pakistan Domestic", "GCC / UAE", "United Kingdom", "Central Asia"],
    },
    media: {
      images: allImages,
      mainImage: product.image,
      videos,
    },
    pricing: {
      basePrice,
      retailPrice,
      currency: "PKR",
      discount,
      profitMargin,
    },
    bulkPricing,
    variants: {
      colors: (product.colorVariants && product.colorVariants.length > 0)
        ? product.colorVariants.map((c, i) => ({
            name: c.name,
            hex: c.hex,
            inStock: c.inStock,
            stockUnits: c.stockUnits || 500,
            image: allImages[i % allImages.length],
          }))
        : (product.colors || ["Classic Tan", "Midnight Black"]).map((col, i) => ({
            name: col,
            hex: i === 0 ? "#C4906B" : "#1C1C1C",
            inStock: true,
            stockUnits: 800,
            image: allImages[i % allImages.length],
          })),
      sizes,
    },
    inventory: {
      SKU: product.sku || "SHOE-2026-001",
      stock: 4500,
      moq: product.moq || 12,
      cartonQty: product.cartonQty || 12,
      inStock: product.inStock !== false,
    },
    specifications: {
      upperMaterial: product.specifications?.["Upper Material"] || product.material || "Full-grain Grade A Leather",
      soleMaterial: product.specifications?.["Sole Material"] || product.soleType || "High-Density Natural Rubber Sole",
      insole: product.specifications?.["Insole"] || "Orthopedic Dual-Density Memory Cushion",
      lining: product.specifications?.["Lining"] || "Breathable Genuine Calfskin / Moisture-Wicking Mesh",
      closure: product.specifications?.["Closure"] || "Precision Buckle / Slip-on Welt",
      toeStyle: product.specifications?.["Toe Style"] || "Classic Ergonomic Stitched",
      origin: product.specifications?.["Origin"] || "Pakistan (Export Quality)",
      weight: product.specifications?.["Weight"] || "approx. 650g - 850g per pair",
      packaging: product.specifications?.["Packaging"] || "Individual Branded Luxury Box + 12 Pairs Export Carton",
      leadTime: product.leadTimeDays || "7–12 Business Days",
      standard: product.specifications?.["Standard"] || "ISO 9001 / SATRA Certified",
    },
    description: product.description || "Mastercrafted wholesale footwear engineered for high retail turnover, maximum margin, and zero defect tolerance.",
    sellingPoints: [
      "100% Genuine Export-Grade Materials with Lab-Tested Durability",
      "Factory-Direct Tiered Wholesale Pricing (Up to 45% Retail Margin)",
      "Custom OEM Branding, Insole Logo Embossing & Custom Box Packaging Available",
      "Fast Nationwide Freight via Leopard / TCS Cargo (3-5 Business Days)",
      "SherSha Trade Assurance Guarantee & Zero-Defect Replacement Warranty",
    ],
    shipping: {
      dispatchDays: product.leadTimeDays || "3-7 Days for In-Stock Lots",
      cartonInfo: `Packed in heavy-duty 5-ply corrugated export cartons (${product.cartonQty || 12} pairs/carton). Master CBM: 0.12`,
      estimatedCostPKR: 1200,
      returnPolicy: "Full replacement or refund guaranteed for manufacturing defects reported within 7 days of delivery receipt.",
      modes: ["TCS / Leopard Freight (Nationwide)", "By-Road Goods Transport (Bilti)", "Direct Factory Pickup"],
    },
    reviews: product.reviews || [],
    stats: {
      rating: avgRating,
      totalReviews,
      fiveStarPct,
      fourStarPct,
      threeStarPct,
      twoStarPct: 0,
      oneStarPct: 0,
      unitsSold: product.stats?.unitsSold || 4820,
      ordersCompleted: product.stats?.ordersCompleted || 240,
      repeatPurchasePct: product.stats?.repeatPurchasePct || 89,
    },
  };
}
