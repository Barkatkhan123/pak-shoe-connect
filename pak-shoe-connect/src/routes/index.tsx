import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
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
} from "lucide-react";

import { SiteLayout } from "@/components/site-layout";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import type { Product } from "@/data/products";

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
    subtitle: "Verified Pakistan manufacturers. Handcrafted Peshawari to formal Oxfords — zero middlemen.",
    cta: "Browse Wholesale Catalog",
    ctaSecondary: "Request Quote",
    link: "/products?gender=men",
  },
  {
    image: CATEGORIES.find((c) => c.slug === "women-heels")?.image,
    eyebrow: "Women's Trade Collection",
    title: "Fashion Forward\nWholesale Range",
    subtitle: "High-margin heels, flats and khussas designed for boutiques and retail chains.",
    cta: "Explore Women's Range",
    ctaSecondary: "Talk to Sales",
    link: "/products?gender=women",
  },
  {
    image: CATEGORIES.find((c) => c.slug === "kids-boys")?.image,
    eyebrow: "School & Institutional Rates",
    title: "School & Kids\nBulk Orders",
    subtitle: "Durable school shoes with flexible MOQs starting at 12 pairs (multiples of 12).",
    cta: "View Kids Collection",
    ctaSecondary: "Request Samples",
    link: "/products?gender=kids",
  },
];

const COMPACT_TRUST_CHIPS = [
  { icon: ShieldCheck, label: "Buyer Protection", sub: "100% QA Inspection" },
  { icon: Truck, label: "Nationwide Logistics", sub: "TCS & Leopards" },
  { icon: Package, label: "Low 12-Pair MOQ", sub: "Multiples of 12" },
  { icon: Sparkles, label: "OEM & Private Label", sub: "Your Brand Embossing" },
  { icon: Globe, label: "Export Ready", sub: "GCC & UK Shipping" },
];

const CATALOG_TABS = [
  { id: "all", label: "All Products" },
  { id: "men", label: "Men's Footwear" },
  { id: "women", label: "Women's Range" },
  { id: "kids", label: "Kids & School" },
  { id: "bestsellers", label: "Best Sellers" },
  { id: "trending", label: "Trending Now" },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [heroHovered, setHeroHovered] = useState(false);
  const [selectedCatalogTab, setSelectedCatalogTab] = useState("all");

  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-advance hero slides
  useEffect(() => {
    if (heroHovered) return;
    const t = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(t);
  }, [heroHovered]);

  // Filter 12-16 products for primary home grid
  const displayedProducts = useMemo(() => {
    let list: Product[] = [];
    switch (selectedCatalogTab) {
      case "men":
        list = PRODUCTS.filter((p) => p.gender === "men");
        break;
      case "women":
        list = PRODUCTS.filter((p) => p.gender === "women");
        break;
      case "kids":
        list = PRODUCTS.filter((p) => p.gender === "kids");
        break;
      case "bestsellers":
        list = PRODUCTS.filter((p) => p.bestseller);
        break;
      case "trending":
        list = PRODUCTS.filter((p) => p.trending);
        break;
      default:
        list = PRODUCTS;
        break;
    }
    return list.slice(0, 16);
  }, [selectedCatalogTab]);

  // Fast-moving carousel products (Best Sellers + Trending)
  const carouselProducts = useMemo(() => {
    return PRODUCTS.filter((p) => p.bestseller || p.trending).slice(0, 8);
  }, []);

  const scrollCarousel = useCallback((dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <SiteLayout>
      {/* ════════════════════════════════════════════════
          1. COMPRESSED HERO — Max 55vh on mobile
      ═══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[380px] sm:min-h-[420px] max-h-[55vh] md:max-h-[560px] overflow-hidden flex flex-col justify-center bg-[#0F1A13]"
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
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Multi-layer Dark Gradient Overlays for High Contrast */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0F1A13]/95 via-[#0F1A13]/85 to-[#0F1A13]/40" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0F1A13] via-transparent to-black/30" />

        {/* Hero Content (Compact 2-line headline, clean CTAs) */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-2xl">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C9A84C] mb-2.5">
              <Sparkles className="h-3 w-3" />
              <span>{slide.eyebrow}</span>
            </div>

            {/* 2-Line Headline */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#FAF7F2] leading-tight tracking-tight whitespace-pre-line">
              {slide.title}
            </h1>

            {/* 1 Supporting Line */}
            <p className="mt-2 text-xs sm:text-sm md:text-base font-medium text-[#FAF7F2]/85 line-clamp-2 max-w-xl">
              {slide.subtitle}
            </p>

            {/* 2 Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
              <Link
                to={slide.link as any}
                className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold bg-[#1B4332] text-[#FAF7F2] hover:bg-[#C9A84C] hover:text-[#0F1A13] transition-all shadow-md active:scale-98"
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
            <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 text-[11px] text-[#FAF7F2]/80">
              <div className="flex gap-0.5 text-[#C9A84C]">
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
          2. WHOLESALE PRODUCT GRID — PRIMARY CONTENT
      ═══════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12 md:py-16 bg-[#FAF7F2] border-b border-[#E0D9CE]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          
          {/* Header & Direct Link */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-1">
                Direct Factory Catalogue
              </div>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F1A13]">
                Wholesale Catalog
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6B5A] mt-1 font-medium">
                Factory-direct pricing, 12-pair low MOQs (multiples of 12), and reliable 3–5 day dispatch nationwide.
              </p>
            </div>
            <Link
              to="/products"
              search={{ category: undefined, gender: undefined }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B4332] hover:text-[#C9A84C] transition-colors self-start sm:self-auto shrink-0"
            >
              <span>View all {PRODUCTS.length} products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Horizontally Scrollable Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {CATALOG_TABS.map((tab) => {
              const active = selectedCatalogTab === tab.id;
              const count =
                tab.id === "all"
                  ? PRODUCTS.length
                  : tab.id === "men"
                  ? PRODUCTS.filter((p) => p.gender === "men").length
                  : tab.id === "women"
                  ? PRODUCTS.filter((p) => p.gender === "women").length
                  : tab.id === "kids"
                  ? PRODUCTS.filter((p) => p.gender === "kids").length
                  : tab.id === "bestsellers"
                  ? PRODUCTS.filter((p) => p.bestseller).length
                  : PRODUCTS.filter((p) => p.trending).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCatalogTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer select-none ${
                    active
                      ? "bg-[#1B4332] text-white shadow-xs"
                      : "bg-white text-foreground/80 hover:text-foreground border border-[#E0D9CE]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? "bg-[#C9A84C] text-[#0F1A13]" : "bg-[#FAF7F2] text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Mobile Grid, 3-Col Tablet, 4-Col Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedProducts.map((product, idx) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={idx}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          {/* Bottom Catalog Action */}
          <div className="mt-8 text-center">
            <Link
              to="/products"
              search={{ category: undefined, gender: undefined }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-[#E0D9CE] text-sm font-bold text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all shadow-xs"
            >
              <span>Explore Complete Wholesale Catalog ({PRODUCTS.length} Models)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════
          3. COMPACT TRUST BAR — Single Horizontal Row
      ═══════════════════════════════════════════════ */}
      <section className="border-b border-[#E0D9CE] bg-white py-4 sm:py-5 overflow-hidden">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            {COMPACT_TRUST_CHIPS.map((chip, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 shrink-0 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E0D9CE]"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded bg-[#1B4332] text-[#C9A84C]">
                  <chip.icon className="h-3.5 w-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-[#0F1A13]">{chip.label}</div>
                  <div className="text-[10px] font-semibold text-[#5C6B5A]">{chip.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          4. SHOP BY CATEGORY — 2-Col Compact Tiles
      ═══════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 bg-[#FAF7F2] border-b border-[#E0D9CE]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-1">
                Wholesale Lines
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F1A13]">
                Shop by Footwear Category
              </h2>
            </div>
            <Link
              to="/products"
              search={{ category: undefined, gender: undefined }}
              className="text-xs sm:text-sm font-bold text-[#1B4332] hover:text-[#C9A84C] flex items-center gap-1"
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
                className="group relative overflow-hidden rounded-xl border border-[#E0D9CE] bg-white aspect-[4/5] flex flex-col justify-end p-3 hover:shadow-md transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A13]/90 via-[#0F1A13]/40 to-transparent" />
                <div className="relative z-10 text-white">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#C9A84C]">
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
          5. BEST SELLERS & TRENDING — Single Carousel
      ═══════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 bg-white border-b border-[#E0D9CE]">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-1">
                <TrendingUp className="h-3 w-3 text-rose-500" />
                <span>Market Demand</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F1A13]">
                Best Sellers & Trending Now
              </h2>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E0D9CE] bg-[#FAF7F2] text-foreground hover:bg-[#1B4332] hover:text-white transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E0D9CE] bg-[#FAF7F2] text-foreground hover:bg-[#1B4332] hover:text-white transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Carousel */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-3 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 snap-x"
          >
            {carouselProducts.map((p, i) => (
              <div key={p.slug} className="w-[180px] sm:w-[220px] md:w-[260px] shrink-0 snap-start">
                <ProductCard product={p} index={i} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════
          6. SLIM OEM / PRIVATE-LABEL BANNER
      ═══════════════════════════════════════════════ */}
      <section className="py-8 sm:py-10 bg-[#1B4332] text-[#FAF7F2] border-b border-[#E0D9CE]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#C9A84C] text-[#0F1A13]">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                  Custom Batch Manufacturing & OEM Private Label
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF7F2]/80 mt-0.5">
                  Launch your footwear brand with custom box packaging, logo embossing, and direct factory pricing.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/bulk-order"
                className="w-full sm:w-auto text-center px-6 py-3 rounded-lg bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0F1A13] font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                Request Custom RFQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </SiteLayout>
  );
}
