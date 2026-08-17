import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Package,
  Sparkles,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

import { SiteLayout } from "@/components/site-layout";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import type { Product } from "@/data/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Anamon — Pakistan's Wholesale Footwear Marketplace" },
      {
        name: "description",
        content:
          "Anamon is Pakistan's premier B2B wholesale footwear marketplace. Direct factory sourcing for retailers nationwide. Men, women & kids. Low MOQ, bulk orders.",
      },
    ],
  }),
});

const HERO_SLIDES = [
  {
    image: CATEGORIES.find((c) => c.slug === "men-peshawari")?.image,
    eyebrow: "Factory Direct Sourcing",
    title: "Source Premium\nFootwear Direct",
    subtitle:
      "Verified Pakistan manufacturers. Handcrafted Peshawari to formal Oxfords — zero middlemen.",
    cta: "Browse Wholesale Catalog",
    ctaSecondary: "Request Quote",
    link: "/products",
  },
  {
    image: CATEGORIES.find((c) => c.slug === "women-heels")?.image,
    eyebrow: "Women's Trade Collection",
    title: "Fashion Forward\nWholesale Range",
    subtitle: "High-margin heels, flats and khussas designed for boutiques and retail chains.",
    cta: "Explore Women's Range",
    ctaSecondary: "Talk to Sales",
    link: "/products",
  },
  {
    image: CATEGORIES.find((c) => c.slug === "kids-boys")?.image,
    eyebrow: "School & Institutional Rates",
    title: "School & Kids\nBulk Orders",
    subtitle: "Durable school shoes with flexible MOQs starting at 12 pairs (multiples of 12).",
    cta: "View Kids Collection",
    ctaSecondary: "Request Samples",
    link: "/products",
  },
];

const COMPACT_TRUST_CHIPS = [
  { icon: ShieldCheck, label: "Buyer Protection", sub: "100% QA Inspection" },
  { icon: Truck, label: "Nationwide Logistics", sub: "TCS & Leopards" },
  { icon: Package, label: "Low 12-Pair MOQ", sub: "Multiples of 12" },
  { icon: Sparkles, label: "OEM & Private Label", sub: "Your Brand Embossing" },
  { icon: Globe, label: "Export Ready", sub: "GCC & UK Shipping" },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [heroHovered, setHeroHovered] = useState(false);

  // Filter/Sort state variables (Reused from products.tsx)
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Auto-advance hero slides
  useEffect(() => {
    if (heroHovered) return;
    const t = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(t);
  }, [heroHovered]);

  // Client-side filtering and sorting logic (Reused from products.tsx)
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;

    if (selectedCats.length > 0) {
      result = result.filter((p) => selectedCats.includes(p.categorySlug));
    }

    if (selectedGender && selectedGender !== "all") {
      result = result.filter((p) => p.gender === selectedGender);
    }

    // Sort safely
    return [...result].sort((a, b) => {
      const aMinPrice = a.priceTiers?.[a.priceTiers.length - 1]?.pricePerPair || 0;
      const bMinPrice = b.priceTiers?.[b.priceTiers.length - 1]?.pricePerPair || 0;
      const aMaxPrice = a.priceTiers?.[0]?.pricePerPair || 0;
      const bMaxPrice = b.priceTiers?.[0]?.pricePerPair || 0;
      const aMoq = a.moq || 0;
      const bMoq = b.moq || 0;

      switch (sort) {
        case "price-low":
          return aMinPrice - bMinPrice;
        case "price-high":
          return bMaxPrice - aMaxPrice;
        case "moq-low":
          return aMoq - bMoq;
        case "newest":
        default:
          return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      }
    });
  }, [selectedCats, selectedGender, sort]);

  // Homepage selection list (first 12 items of the filtered set)
  const homeProducts = useMemo(() => {
    return filteredProducts.slice(0, 12);
  }, [filteredProducts]);

  const toggleCategory = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearAllFilters = () => {
    setSelectedCats([]);
    setSelectedGender(null);
    setSort("newest");
  };

  const activeFiltersCount =
    (selectedCats.length > 0 ? selectedCats.length : 0) + (selectedGender ? 1 : 0);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <SiteLayout>
      {/* ════════════════════════════════════════════════
          1. PRODUCTS SECTION — Rendered immediately below header
      ═══════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-leather mb-1">
              PROVEN PERFORMERS
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-ink">
              Consistent Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              Explore our highest-velocity wholesale lines. Direct factory rates, low 12-pair MOQs, and reliable delivery across Pakistan.
            </p>
          </div>

          {/* Filters, Showing Count, and Sort Bar */}
          <div className="flex items-center justify-between gap-2 mb-6 bg-white border border-border p-2.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              {/* Trigger Sheet Drawer for filters */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-ink hover:bg-black/5 transition-all cursor-pointer"
                aria-label="Open filter options"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="grid h-4 min-w-[16px] px-1 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="text-xs font-bold text-leather bg-background border border-border px-3 py-2 rounded-lg shrink-0">
                Showing {homeProducts.length} of {filteredProducts.length} Products
              </div>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-lg border border-border bg-background pl-3 pr-7 py-2 text-xs font-bold text-ink outline-none cursor-pointer hover:bg-white transition-colors"
                  aria-label="Sort product catalog"
                >
                  <option value="newest">Sort: Newest Arrival</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="moq-low">MOQ: Lowest First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters chips */}
          {activeFiltersCount > 0 && (
            <div className="mb-6 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Active:
              </span>
              {selectedGender && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold capitalize">
                  {selectedGender}
                  <button
                    onClick={() => setSelectedGender(null)}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCats.map((slug) => {
                const catObj = CATEGORIES.find((c) => c.slug === slug);
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold"
                  >
                    {catObj?.name || slug}
                    <button
                      onClick={() => toggleCategory(slug)}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid (1 col mobile, 2 col tablet, 3-4 col desktop) */}
          {homeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {homeProducts.map((product, idx) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  index={idx}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-border p-6">
              <Package className="h-12 w-12 text-leather opacity-40 mb-3" />
              <h3 className="font-display text-lg font-bold text-ink">
                No matching footwear found
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm font-medium">
                Try adjusting your category or gender filter criteria, or reset to view all.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-gold hover:text-ink transition shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Primary CTA Under Grid */}
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-border text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-xs"
            >
              <span>Browse Wholesale Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          2. TRUST STRIP — Single Horizontal Row
      ═══════════════════════════════════════════════ */}
      <section className="border-b border-border bg-white py-4 sm:py-5 overflow-hidden">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {COMPACT_TRUST_CHIPS.map((chip, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 shrink-0 px-3 py-1.5 rounded-lg bg-background border border-border"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-primary text-gold">
                  <chip.icon className="h-3.5 w-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-ink">{chip.label}</div>
                  <div className="text-[10px] font-semibold text-muted-foreground">{chip.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          3. HERO BLOCK — Source Premium Footwear Direct
      ═══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[380px] sm:min-h-[420px] max-h-[55vh] md:max-h-[560px] overflow-hidden flex flex-col justify-center bg-ink"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <img src={slide.image} alt="" className="h-full w-full object-cover object-center" />
          </motion.div>
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink/95 via-ink/85 to-ink/40" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-transparent to-black/30" />

        {/* Hero Content */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-2xl">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/40 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gold mb-2.5">
              <Sparkles className="h-3 w-3" />
              <span>{slide.eyebrow}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-background leading-tight tracking-tight whitespace-pre-line">
              {slide.title}
            </h1>

            {/* Supporting Copy */}
            <p className="mt-2 text-xs sm:text-sm md:text-base font-medium text-background/85 line-clamp-2 max-w-xl">
              {slide.subtitle}
            </p>

            {/* Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
              <Link
                to={slide.link as any}
                className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold bg-primary text-background hover:bg-gold hover:text-ink transition-all shadow-md active:scale-98"
              >
                <span>{slide.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/bulk-order"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold border border-white/30 text-white bg-black/20 hover:bg-white/10 backdrop-blur-xs transition-all active:scale-98"
              >
                <span>{slide.ctaSecondary}</span>
              </Link>
            </div>

            {/* Trust Rating Strip */}
            <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 text-background/80">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <span className="font-semibold">
                Trusted by <strong className="text-white font-bold">1,200+</strong> wholesale buyers across Pakistan
              </span>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentSlide ? "24px" : "6px",
                background: i === currentSlide ? "#C9A84C" : "rgba(255,255,255,0.3)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          4. SHOP BY CATEGORY — Dark Section
      ═══════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 bg-ink text-background border-b border-border">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold mb-1">
                FULL WHOLESALE CATALOG
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/products"
              search={{ category: undefined, gender: undefined }}
              className="text-xs sm:text-sm font-bold text-gold hover:text-white flex items-center gap-1"
            >
              All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                to="/products"
                search={{ category: cat.slug, gender: undefined }}
                className="group relative overflow-hidden rounded-xl border border-border bg-white aspect-[4/5] flex flex-col justify-end p-3 hover:shadow-md transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                <div className="relative z-10 text-white">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gold">
                    {cat.productCount}+ SKUs
                  </div>
                  <h3 className="font-display text-xs sm:text-sm font-bold leading-tight mt-0.5 text-white">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          5. FACTORY INFORMATION — last content section before footer
      ═══════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-leather mb-2">
              <Award className="h-3.5 w-3.5" />
              <span>Verified Manufacturer Status</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
              Anamon Production Facilities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">
              We own and operate dual high-capacity footwear factories in Rawalpindi & Lahore, 
              delivering handcrafted traditional craftsmanship and industrial precision under one roof.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            <div className="rounded-xl border border-border bg-background p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary">15,000+ Pairs</div>
              <div className="text-xs font-bold text-ink mt-1">Monthly Production Capacity</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary">2 Active Plants</div>
              <div className="text-xs font-bold text-ink mt-1">Rawalpindi & Lahore</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary">3-Stage QC</div>
              <div className="text-xs font-bold text-ink mt-1">In-House Quality Control</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-primary">10–14 Days</div>
              <div className="text-xs font-bold text-ink mt-1">Standard B2B Lead Time</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border p-6 sm:p-8 bg-background">
              <h3 className="font-display text-lg sm:text-xl font-bold text-ink mb-3">Our Craftsmanship & Materials</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                Every pair is built using premium full-grain buffalo and cow leather sourced from local tanneries, 
                combined with high-durability PU, TPR, and vulcanized rubber sole moulding. Our skilled 
                artisans hand-sew upper stitching lines, ensuring maximum lifespan and premium comfort.
              </p>
            </div>
            <div className="rounded-xl border border-border p-6 sm:p-8 bg-background">
              <h3 className="font-display text-lg sm:text-xl font-bold text-ink mb-3">Anamon Trade Assurance</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                We guarantee order accuracy, direct factory-wholesale pricing, and secure escrow payment collection. 
                All batches go through material inspection, stitching line audit, and pre-pack checking before 
                dispatching via TCS/Leopards freight networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters sheet drawer (shadcn Sheet) */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="bg-white border-l border-border p-6 max-h-screen overflow-y-auto w-full max-w-xs">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="font-display text-base font-bold text-ink">Filter Catalog</SheetTitle>
            <SheetDescription className="hidden">Filter options for the wholesale catalog</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            {/* Gender filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-leather mb-3">Gender Collection</h3>
              <div className="space-y-2">
                {["all", "men", "women", "kids", "unisex"].map((g) => (
                  <label key={g} className="flex items-center gap-3 text-sm font-semibold capitalize cursor-pointer">
                    <input
                      type="radio"
                      name="home-gender"
                      checked={g === "all" ? selectedGender === null : selectedGender === g}
                      onChange={() => setSelectedGender(g === "all" ? null : g)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span>{g === "all" ? "All Footwear" : g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-leather mb-3">Footwear Categories</h3>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
                {CATEGORIES.map((c) => (
                  <label key={c.slug} className="flex items-center justify-between text-sm font-semibold cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(c.slug)}
                        onChange={() => toggleCategory(c.slug)}
                        className="h-4 w-4 rounded text-primary focus:ring-primary"
                      />
                      <span>{c.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-background border border-border px-1.5 py-0.2 rounded font-bold">
                      {c.productCount}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-2.5 rounded-lg border border-border bg-white text-xs font-bold text-ink hover:bg-black/5 cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 py-2.5 rounded-lg bg-primary text-white text-xs font-bold shadow-xs hover:bg-gold hover:text-ink transition cursor-pointer"
            >
              Apply ({filteredProducts.length})
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </SiteLayout>
  );
}
