import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { getProduct, relatedProducts, CATEGORIES } from "@/data/products";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  Star,
  Share2,
  Heart,
  Info,
  Factory,
  Check,
  MessageCircle,
  Truck,
  Package2,
  ShieldCheck,
  CreditCard,
  RefreshCcw,
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProductGallery } from "@/components/product/product-gallery";
import { PriceTiers } from "@/components/product/price-tiers";
import { SizeQuantityMatrix } from "@/components/product/size-quantity-matrix";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { SpecTable } from "@/components/product/spec-table";
import { ProductTabs } from "@/components/product/product-tabs";
import { RecommendationRow } from "@/components/product/recommendation-row";
import { ReviewCard } from "@/components/review-card";
import { MOQInfoCard } from "@/components/moq-info-card";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useWishlist } from "@/hooks/use-wishlist";
import { waLink } from "@/lib/site";

function ColorSelector({
  variants,
  selectedColor,
  onChange,
}: {
  variants: Array<{ name: string; hex: string }>;
  selectedColor: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Select Color: <span className="text-foreground">{selectedColor}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.name}
            type="button"
            onClick={() => onChange(v.name)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              selectedColor === v.name
                ? "border-primary bg-primary/10 text-primary font-bold"
                : "border-border hover:border-primary/50 text-muted-foreground"
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: v.hex }}
            />
            <span>{v.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Route Definition ─── */

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductDetail,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Product"} Wholesale | SherSha` },
      { name: "description", content: loaderData?.product.description ?? "" },
    ],
  }),
});

/* ─── Component ─── */

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const related = relatedProducts(product, 6);
  const category = CATEGORIES.find((c) => c.slug === product.categorySlug);

  /* State */
  const [selectedColor, setSelectedColor] = useState(
    product.colorVariants[0]?.name ?? "",
  );
  const [matrixTotals, setMatrixTotals] = useState({
    totalPairs: 0,
    totalAmount: 0,
    quantities: {} as Record<string, number>,
  });

  const { addItem, isInBasket } = useInquiryBasket();
  const { toggleItem, isWishlisted } = useWishlist();
  const inBasket = isInBasket(product.slug);
  const wishlisted = isWishlisted(product.slug);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);

  // Share handler
  const handleShare = useCallback(async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} — wholesale from SherSha`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // User cancelled share
    }
  }, [product.name]);

  /* Derived */
  const avgRating =
    product.reviews.length > 0
      ? (
          product.reviews.reduce((s, r) => s + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : "0";

  /* Handlers */
  const handleSelectionChange = useCallback(
    (totals: {
      totalPairs: number;
      totalAmount: number;
      quantities: Record<string, number>;
    }) => {
      setMatrixTotals(totals);
    },
    [],
  );

  const handleWhatsApp = () => {
    const sizeDetails = Object.entries(matrixTotals.quantities)
      .filter(([, qty]) => qty > 0)
      .map(([size, qty]) => `  ${size}: ${qty} pairs`)
      .join("\n");

    const msg = `Hi SherSha, I am interested in wholesale inquiry for:\n\n*${product.name}* (SKU: ${product.sku})\nColor: ${selectedColor}\n${sizeDetails ? `Sizes:\n${sizeDetails}` : ""}\nTotal: ${matrixTotals.totalPairs} pairs\n\nPlease send pricing details.`;
    window.open(waLink(msg), "_blank");
  };

  /* JSON-LD Structured Data */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "SherSha" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "PKR",
      lowPrice:
        product.priceTiers[product.priceTiers.length - 1].pricePerPair,
      highPrice: product.priceTiers[0].pricePerPair,
      offerCount: product.priceTiers.length,
    },
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  const selectedColorIndex = product.colorVariants.findIndex((c) => c.name === selectedColor);
  const selectedColorImage = (selectedColorIndex >= 0 && product.images[selectedColorIndex])
    ? product.images[selectedColorIndex]
    : product.images[0];

  return (
    <SiteLayout>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen pb-12">
        {/* ━━━━━━ Sticky Utility Bar ━━━━━━ */}
        <div className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-hidden">
              <Link to="/" className="hover:text-primary transition-colors shrink-0">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link
                to="/products"
                search={{ category: undefined, gender: undefined }}
                className="hover:text-primary transition-colors shrink-0"
              >
                Products
              </Link>
              {category && (
                <>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <Link
                    to="/products"
                    search={{ category: category.slug, gender: undefined }}
                    className="hover:text-primary transition-colors shrink-0"
                  >
                    {category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => toggleItem(product)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  wishlisted
                    ? "text-rose-500"
                    : "text-muted-foreground hover:text-rose-500"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`}
                />
                <span className="hidden sm:inline">
                  {wishlisted ? "Saved" : "Save"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ━━━━━━ Main Container ━━━━━━ */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          {/* ────── HERO BLOCK — 12-col grid ────── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6 animate-slide-up">
            {/* Gallery — cols 1–5 */}
            <div className="xl:col-span-5">
              <ProductGallery product={product} selectedColorImage={selectedColorImage} />
            </div>

            {/* Core Info — cols 6–9 */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div>
                {/* Product Title */}
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight text-balance line-clamp-2">
                  {product.name}
                </h1>

                {/* Ratings Row */}
                <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(Number(avgRating))
                            ? "fill-gold text-gold"
                            : "text-muted"
                        }`}
                      />
                    ))}
                    <span className="font-semibold text-foreground ml-1">
                      {avgRating}
                    </span>
                  </div>
                  <span className="text-border">|</span>
                  <a
                    href="#reviews"
                    className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                  >
                    ({product.reviews.length} reviews)
                  </a>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {product.stats.unitsSold.toLocaleString()}
                    </span>{" "}
                    sold
                  </span>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">
                    &lt; 2h response rate
                  </span>
                </div>
              </div>

              {/* MOQ Policy Card */}
              <MOQInfoCard variant="short" />

              {/* Price Tiers */}
              <PriceTiers
                tiers={product.priceTiers}
                selectedQuantity={matrixTotals.totalPairs}
              />

              {/* Variant Selectors */}
              <div className="flex flex-col gap-6">
                {/* Color Selector */}
                {product.colorVariants.length > 0 && (
                  <ColorSelector
                    variants={product.colorVariants}
                    selectedColor={selectedColor}
                    onChange={setSelectedColor}
                  />
                )}

                {/* Size & Quantity Matrix */}
                <SizeQuantityMatrix
                  product={product}
                  selectedColor={selectedColor}
                  onSelectionChange={handleSelectionChange}
                />
              </div>

              {/* Key Attributes */}
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-3">
                  Key Attributes
                </h3>
                <div className="bg-muted/40 rounded-xl p-4 grid grid-cols-2 gap-y-4 text-sm">
                  {[
                    {
                      label: "Material",
                      value: product.material.split("·")[0].trim() || "Genuine leather",
                    },
                    {
                      label: "Sole",
                      value: product.soleType,
                    },
                    { label: "Gender", value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) },
                    {
                      label: "Place of origin",
                      value: <span className="text-emerald">Lahore, PK</span>,
                    },
                    { label: "Packaging", value: "12 pairs / carton (Single color)" },
                    { label: "Minimum Order", value: "12 pairs (1 carton)" },
                    {
                      label: "Lead time",
                      value: `${product.leadTimeDays} days`,
                    },
                    {
                      label: "Customization",
                      value: product.customization?.length > 0 ? "OEM/ODM" : "None",
                    },
                  ].map((attr, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground w-28 shrink-0">{attr.label}:</span>
                      <span className="font-medium text-foreground">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping estimator row */}
              <div className="flex flex-wrap items-center gap-3 text-sm border-t border-border pt-6">
                <span className="text-muted-foreground">Ship to <button className="font-medium hover:underline text-foreground">Lahore ▾</button></span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground">Lead time: <span className="font-medium text-foreground">{product.leadTimeDays}d</span></span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground">Freight: <span className="font-medium text-foreground">Estimate</span></span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground">Logistics: <span className="font-medium text-foreground">TCS / Leopards</span></span>
              </div>
            </div>

            {/* Purchase Panel — cols 10–12 */}
            <div className="xl:col-span-3">
              <PurchasePanel
                product={product}
                totalPairs={matrixTotals.totalPairs}
                totalAmount={matrixTotals.totalAmount}
                selectedColor={selectedColor}
              />
            </div>
          </div>

          {/* ────── PRODUCT TABS (sticky nav) ────── */}
          <div className="mt-10">
            <ProductTabs />
          </div>

          {/* ────── TABBED BODY ────── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
            {/* Main Content — cols 1–9 */}
            <div className="xl:col-span-9 flex flex-col gap-10">
              {/* ── Details Section ── */}
              <section
                id="details"
                className="scroll-mt-24 rounded-2xl bg-card border border-border premium-shadow p-6 sm:p-8 animate-slide-up"
              >
                {/* Wholesale Notice */}
                <div className="flex gap-3 items-start rounded-xl bg-primary/5 border border-primary/10 p-4 mb-8">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">
                      Wholesale Notice:
                    </strong>{" "}
                    This product is shipped directly from our partner
                    factories in Lahore. Prices exclude shipping. For custom
                    packaging or OEM branding, mention in your inquiry.
                  </p>
                </div>

                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Product Overview
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  {product.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                      <Factory className="w-5 h-5 text-muted-foreground" />
                      Manufacturing Details
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Production Capacity:
                        </strong>{" "}
                        {product.productionCapacity}
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Lead Time:
                        </strong>{" "}
                        {product.leadTimeDays} days for regular orders
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Packaging:
                        </strong>{" "}
                        Custom printed boxes available
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Quality Control:
                        </strong>{" "}
                        100% inspection before shipment
                      </li>
                    </ul>
                  </div>
                  {product.customization?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                        <Check className="w-5 h-5 text-muted-foreground" />
                        OEM/ODM Capabilities
                      </h4>
                      <ul className="space-y-2">
                        {product.customization.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Product Showcase */}
                <h4 className="font-display text-lg font-semibold text-foreground mb-6 text-center">
                  Product Showcase
                </h4>
                <div className="flex flex-col gap-4 items-center">
                  {product.images.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="w-full max-w-[720px] bg-muted/40 rounded-xl overflow-hidden flex items-center justify-center p-2"
                    >
                      <img
                        src={img}
                        alt={`${product.name} showcase ${i + 1}`}
                        className="w-full h-auto object-contain mix-blend-multiply"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Company Profile / Specs Section ── */}
              <section
                id="company"
                className="scroll-mt-24 rounded-2xl bg-card border border-border premium-shadow p-6 sm:p-8 animate-slide-up"
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Specifications
                </h2>
                <SpecTable product={product} />

                <div className="mt-12">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Company Profile
                  </h2>
                  
                  {/* Banner Image */}
                  <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-8">
                    <img src="https://images.unsplash.com/photo-1604066867775-43f48e3957d8?w=1200&q=80" alt="Factory Floor" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 hero-overlay-premium flex flex-col justify-end p-6">
                      <h3 className="font-display text-2xl font-bold text-white mb-1">SherSha Footwear Pvt. Ltd.</h3>
                      <p className="text-white/80 text-sm">Premium Leather Manufacturing · Established 1998</p>
                    </div>
                  </div>

                  {/* Factory Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                      <div className="font-display text-xl font-bold text-foreground">15,000 m²</div>
                      <div className="text-xs text-muted-foreground mt-1">Floor Area</div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                      <div className="font-display text-xl font-bold text-foreground">350+</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Staff</div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                      <div className="font-display text-xl font-bold text-foreground">2M Pairs</div>
                      <div className="text-xs text-muted-foreground mt-1">Annual Output</div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                      <div className="font-display text-xl font-bold text-foreground">ME, EU, PK</div>
                      <div className="text-xs text-muted-foreground mt-1">Main Markets</div>
                    </div>
                  </div>

                  {/* Production Line Photo Strip */}
                  <h4 className="font-semibold text-foreground mb-4 text-sm">Production Line</h4>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                    {[
                      "https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=400&q=80",
                      "https://images.unsplash.com/photo-1596558450268-9c2752494916?w=400&q=80",
                      "https://images.unsplash.com/photo-1610260485609-b6a695d7eb80?w=400&q=80",
                      "https://images.unsplash.com/photo-1604066867775-43f48e3957d8?w=400&q=80"
                    ].map((img, i) => (
                      <div key={i} className="w-48 h-32 shrink-0 rounded-lg overflow-hidden snap-start">
                        <img src={img} alt={`Production step ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Certifications Row */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {["ISO 9001", "BSCI Certified", "Sedex Member", "100% QC Passed"].map(
                      (cert) => (
                        <span
                          key={cert}
                          className="text-xs font-medium bg-emerald/10 text-emerald px-3 py-1.5 rounded-full"
                        >
                          {cert}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </section>

              {/* ── Reviews Section ── */}
              <section
                id="reviews"
                className="scroll-mt-24 rounded-2xl bg-card border border-border premium-shadow p-6 sm:p-8 animate-slide-up"
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Customer Reviews ({product.reviews.length})
                </h2>

                {product.reviews.length > 0 ? (
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Summary */}
                    <div className="md:w-64 shrink-0">
                      <div className="bg-muted/30 rounded-xl p-6 text-center border border-border/50">
                        <div className="font-display text-5xl font-bold text-foreground mb-2">
                          {avgRating}
                        </div>
                        <div className="flex justify-center gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.round(Number(avgRating))
                                  ? "fill-gold text-gold"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.reviews.length} Verified Buyers
                        </p>

                        <div className="mt-6 space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = product.reviews.filter(
                              (r) => r.rating === rating,
                            ).length;
                            const percent =
                              (count / product.reviews.length) * 100;
                            return (
                              <div
                                key={rating}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="w-3 text-muted-foreground font-medium">
                                  {rating}
                                </span>
                                <Star className="w-3 h-3 text-muted" />
                                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="w-5 text-right text-xs text-muted-foreground">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    <div className="flex-1 flex flex-col gap-6">
                      {/* Filter Chips */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setReviewFilter(null)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${reviewFilter === null ? "bg-primary/10 text-primary border-primary/20" : "bg-transparent border-border text-foreground hover:bg-muted"}`}
                        >
                          All ({product.reviews.length})
                        </button>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = product.reviews.filter(r => r.rating === star).length;
                          return (
                            <button
                              key={star}
                              onClick={() => setReviewFilter(reviewFilter === star ? null : star)}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${reviewFilter === star ? "bg-primary/10 text-primary border-primary/20" : "bg-transparent border-border text-foreground hover:bg-muted"}`}
                            >
                              {star}★ ({count})
                            </button>
                          );
                        })}
                      </div>

                      {(reviewFilter ? product.reviews.filter(r => r.rating === reviewFilter) : product.reviews).map((r) => (
                        <ReviewCard key={r.id} review={r} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No reviews yet for this product.
                  </div>
                )}
              </section>

              {/* ── Shipping Section ── */}
              <section
                id="shipping"
                className="scroll-mt-24 rounded-2xl bg-card border border-border premium-shadow p-6 sm:p-8 animate-slide-up"
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Shipping &amp; Logistics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-5 rounded-xl bg-muted/30 border border-border/50">
                    <Package2 className="w-8 h-8 mx-auto text-primary mb-2" />
                    <div className="font-semibold text-foreground text-lg">
                      {product.moq}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Minimum Order
                    </div>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-muted/30 border border-border/50">
                    <Truck className="w-8 h-8 mx-auto text-primary mb-2" />
                    <div className="font-semibold text-foreground text-lg">
                      {product.leadTimeDays}d
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lead Time
                    </div>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-muted/30 border border-border/50">
                    <ShieldCheck className="w-8 h-8 mx-auto text-emerald mb-2" />
                    <div className="font-semibold text-foreground text-lg">
                      100%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      QC Inspection
                    </div>
                  </div>
                </div>

                {/* Logistics Options Table */}
                <h3 className="font-semibold text-foreground mb-4">Logistics Options</h3>
                <div className="rounded-xl border border-border overflow-hidden mb-8 text-sm">
                  <div className="grid grid-cols-4 bg-muted/40 p-3 font-medium text-muted-foreground border-b border-border">
                    <div className="col-span-1">Method</div>
                    <div className="col-span-1">Est. Time</div>
                    <div className="col-span-1">Tracking</div>
                    <div className="col-span-1">Cost</div>
                  </div>
                  <div className="grid grid-cols-4 p-3 border-b border-border text-foreground hover:bg-muted/20">
                    <div className="col-span-1 font-medium">By Express (DHL/FedEx)</div>
                    <div className="col-span-1">3-7 days</div>
                    <div className="col-span-1 text-emerald">Available</div>
                    <div className="col-span-1">Highest</div>
                  </div>
                  <div className="grid grid-cols-4 p-3 border-b border-border text-foreground hover:bg-muted/20">
                    <div className="col-span-1 font-medium">By Air Freight</div>
                    <div className="col-span-1">7-14 days</div>
                    <div className="col-span-1 text-emerald">Available</div>
                    <div className="col-span-1">Medium</div>
                  </div>
                  <div className="grid grid-cols-4 p-3 text-foreground hover:bg-muted/20">
                    <div className="col-span-1 font-medium">By Sea (FCL/LCL)</div>
                    <div className="col-span-1">20-35 days</div>
                    <div className="col-span-1 text-emerald">Available</div>
                    <div className="col-span-1">Lowest</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Payment Methods */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-muted-foreground" /> Payment Methods
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">T/T, L/C, Western Union, MoneyGram, Secure Escrow.</p>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-muted rounded border border-border text-xs font-bold">VISA</div>
                      <div className="px-3 py-1 bg-muted rounded border border-border text-xs font-bold">MasterCard</div>
                      <div className="px-3 py-1 bg-muted rounded border border-border text-xs font-bold">T/T</div>
                      <div className="px-3 py-1 bg-muted rounded border border-border text-xs font-bold">L/C</div>
                    </div>
                  </div>
                  
                  {/* Returns Policy */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <RefreshCcw className="w-5 h-5 text-muted-foreground" /> Returns &amp; Refunds
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      If the product is not dispatched on time or does not meet the agreed quality standards, you are eligible for a refund. Claim must be filed within 7 days of delivery.
                    </p>
                  </div>
                </div>
              </section>

              {/* ── FAQ Section ── */}
              <section
                id="faq"
                className="scroll-mt-24 rounded-2xl bg-card border border-border premium-shadow p-6 sm:p-8 animate-slide-up"
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="max-w-[720px]">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      {
                        q: "Can I get a sample before placing a bulk order?",
                        a: "Yes, we provide samples. The sample cost will be refunded when your bulk order exceeds 500 pairs.",
                      },
                      {
                        q: "Can you put my logo on the shoes?",
                        a: "Absolutely. OEM services are available. We can emboss your logo on the upper or print it on the insole. Minimum order quantity applies.",
                      },
                      {
                        q: "What is the lead time for production?",
                        a: `For in-stock items, 3–5 days. For custom orders, ${product.leadTimeDays} days after sample approval and deposit.`,
                      },
                      {
                        q: "What payment methods do you accept?",
                        a: "We accept bank transfers, Easypaisa, JazzCash, and secure escrow payments for large orders.",
                      },
                    ].map((item, i) => (
                      <AccordionItem key={i} value={`item-${i}`} className="border-border px-1">
                        <AccordionTrigger className="hover:no-underline font-semibold text-foreground text-sm py-4">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>
            </div>

            {/* Sidebar — cols 10–12 */}
            <div className="xl:col-span-3 hidden xl:block">
              <div className="sticky top-28 space-y-4">
                {/* Buyer Protection */}
                <div className="rounded-2xl bg-card border border-border premium-shadow p-5">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-emerald" /> Buyer
                    Protection
                  </h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <span className="text-emerald font-bold shrink-0">
                        ✓
                      </span>
                      <span>
                        Full refund if product is not dispatched in{" "}
                        {product.leadTimeDays} days.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald font-bold shrink-0">
                        ✓
                      </span>
                      <span>Secure payments via Escrow service.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald font-bold shrink-0">
                        ✓
                      </span>
                      <span>
                        Free quality inspection before shipment.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl bg-card border border-border premium-shadow p-5">
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {product.stats.ordersCompleted}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Orders
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {product.stats.activeBuyers}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Buyers
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">
                        {product.stats.repeatPurchasePct}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Repeat Rate
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald text-lg">
                        A+
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Supplier Grade
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ────── Recommendations ────── */}
          <RecommendationRow
            title="You May Also Like"
            products={related}
          />
        </div>

        {/* ━━━━━━ Sticky Mobile Bottom Bar ━━━━━━ */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 p-3 flex gap-2 z-50">
          <button
            onClick={handleWhatsApp}
            className="w-11 h-11 rounded-full flex items-center justify-center border border-border bg-background shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="flex-1 bg-muted text-foreground font-bold text-sm rounded-full py-3">
            Sample
          </button>
          <button
            onClick={() => addItem(product, { color: selectedColor })}
            disabled={inBasket}
            className={`flex-1 font-bold text-sm rounded-full py-3 transition-colors ${
              inBasket
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {inBasket ? "Added ✓" : "Send Inquiry"}
          </button>
        </div>
        {/* Spacer for fixed bottom bar on mobile */}
        <div className="xl:hidden h-[72px]" />
      </div>
    </SiteLayout>
  );
}