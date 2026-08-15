import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  Factory,
  Truck,
  BadgeCheck,
  Package,
  ShieldCheck,
  Sparkles,
  Check,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { SiteLayout } from "@/components/site-layout";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { AnimatedCounter } from "@/components/animated-counter";
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
          "Anamon is Pakistan's premier B2B wholesale footwear marketplace. Sourcing from factories to retailers nationwide. Men, women & kids. Private label, bulk orders.",
      },
    ],
  }),
});

const HERO_SLIDES = [
  {
    image: CATEGORIES.find(c => c.slug === "men-peshawari")?.image,
    title: "Premium Men's Collection",
    subtitle: "From handcrafted Peshawari to corporate Oxfords. Sourced directly from our top-tier manufacturing partners in Lahore.",
    cta: "Shop Men's Wholesale",
    link: "/products?gender=men"
  },
  {
    image: CATEGORIES.find(c => c.slug === "women-heels")?.image,
    title: "Women's Fashion Line",
    subtitle: "Fast-moving heels, flats, and khussas engineered for boutiques and retail chains nationwide.",
    cta: "Explore Women's",
    link: "/products?gender=women"
  },
  {
    image: CATEGORIES.find(c => c.slug === "kids-boys")?.image,
    title: "Back to School Volume",
    subtitle: "Durable PU and premium leather school shoes. Institutional pricing available for orders exceeding 500 pairs.",
    cta: "View Kids Range",
    link: "/products?gender=kids"
  }
];

const bestSellers = PRODUCTS.filter((p) => p.bestseller).slice(0, 4);
const trendingProducts = PRODUCTS.filter(p => p.trending);

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [heroHovered, setHeroHovered] = useState(false);

  // Parallax for OEM section
  const oemRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: oemRef, offset: ["start end", "end start"] });
  const oemY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Trending section scroll ref
  const trendingRef = useRef<HTMLDivElement>(null);
  const scrollTrending = useCallback((dir: 'left' | 'right') => {
    if (!trendingRef.current) return;
    const scrollAmount = 360;
    trendingRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

  // Trust strip ref for entrance animation
  const trustRef = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: "-50px" });

  // Auto-advance slider — pauses on hover
  useEffect(() => {
    if (heroHovered) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, [heroHovered]);

  return (
    <SiteLayout>
      {/* ── Cinematic Hero Slider ── */}
      <section
        className="relative h-[85vh] min-h-[680px] w-full overflow-hidden bg-ink"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 z-10 hero-overlay-premium" />
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt=""
              className="h-full w-full object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-20">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md mb-8"
            >
              <BadgeCheck className="h-4 w-4 text-gold" /> B2B Verified Suppliers
            </motion.div>
            
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl md:text-[80px] drop-shadow-xl">
              {HERO_SLIDES[currentSlide].title}
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-cream/90 sm:text-xl drop-shadow-md">
              {HERO_SLIDES[currentSlide].subtitle}
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to={HERO_SLIDES[currentSlide].link as any}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-white hover:text-primary hover:scale-105"
              >
                {HERO_SLIDES[currentSlide].cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/bulk-order"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 glass-dark px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/20"
              >
                Request Custom Quote
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                i === currentSlide ? "w-12 bg-white" : "w-3 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div ref={trustRef} className="border-b border-border bg-white shadow-sm relative z-30">
        <div className="mx-auto flex max-w-7xl overflow-x-auto py-5 px-4 scrollbar-hide">
          <div className="flex min-w-max items-center gap-10 sm:gap-16 md:mx-auto">
            {[
              { icon: Truck, label: "Nationwide Logistics", sub: "TCS & Leopards Integration" },
              { icon: ShieldCheck, label: "Buyer Protection", sub: "100% Quality Assurance" },
              { icon: Package, label: "Low MOQ", sub: "Start from just 50 pairs" },
              { icon: Sparkles, label: "OEM Customization", sub: "Your Brand, Our Factory" },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={trustInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 group"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white shadow-md transition-transform group-hover:scale-110 group-hover:bg-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">{t.label}</div>
                  <div className="text-[11px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wide">{t.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trending Horizontal Scroll ── */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 md:py-32 overflow-hidden bg-noise">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              <TrendingUp className="h-3.5 w-3.5" /> Market Insights
            </div>
            <h2 className="font-display text-4xl font-extrabold md:text-5xl text-ink">Trending Now</h2>
            <p className="mt-3 text-lg font-medium text-muted-foreground">Fastest moving SKUs this week across Pakistani retail.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollTrending('left')} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white shadow-sm hover:bg-ink hover:text-white hover:border-ink transition-all" aria-label="Scroll left">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => scrollTrending('right')} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white shadow-sm hover:bg-ink hover:text-white hover:border-ink transition-all" aria-label="Scroll right">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <Link to="/products" search={{ category: undefined, gender: undefined }} className="group inline-flex text-sm font-bold text-ink hover:text-primary items-center gap-1.5 transition-colors">
              View All Catalog <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        <div ref={trendingRef} className="flex gap-5 sm:gap-8 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {trendingProducts.map((p, i) => (
            <div key={p.slug} className="min-w-[280px] w-[280px] sm:min-w-[340px] sm:w-[340px] snap-center shrink-0">
              <ProductCard product={p} index={i} onQuickView={setQuickViewProduct} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Asymmetric Categories Layout ── */}
      <section className="bg-ink py-20 md:py-32 text-white relative overflow-hidden">
        {/* bg decorative element */}
        <div className="absolute top-0 right-0 -mr-[20%] -mt-[10%] w-[60%] aspect-square rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="mb-16">
            <h2 className="font-display text-4xl font-extrabold md:text-5xl">Shop by Category</h2>
            <p className="mt-4 text-lg text-cream/70 max-w-2xl font-medium">Source exactly what your retail market needs with our curated wholesale collections.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Large Featured Category */}
            <div className="md:col-span-8">
              {CATEGORIES[0] && (
                <CategoryBlock c={CATEGORIES[0]} large />
              )}
            </div>
            {/* Two stacked categories */}
            <div className="md:col-span-4 flex flex-col gap-4 md:gap-6">
              {CATEGORIES[1] && <CategoryBlock c={CATEGORIES[1]} />}
              {CATEGORIES[2] && <CategoryBlock c={CATEGORIES[2]} />}
            </div>
            
            {/* Row 2: three equal columns */}
            {CATEGORIES.slice(3, 6).map((c) => (
              <div key={c.slug} className="md:col-span-4">
                <CategoryBlock c={c} />
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/products" search={{ category: undefined, gender: undefined }} className="inline-flex items-center gap-2 rounded-full border border-white/30 glass-dark px-10 py-4 text-sm font-bold text-white hover:bg-white hover:text-ink transition-all hover:scale-105">
              Browse All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="bg-white py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-4 md:divide-x divide-border">
            <AnimatedCounter value={15000} suffix="+" label="Pairs Sold Monthly" delay={100} />
            <AnimatedCounter value={1200} suffix="+" label="Wholesale Buyers" delay={200} />
            <AnimatedCounter value={25} suffix="+" label="Years Heritage" delay={300} />
            <AnimatedCounter value={98} suffix="%" label="Satisfaction Rate" delay={400} />
          </div>
        </div>
      </section>

      {/* ── Best Sellers Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-32 bg-noise">
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
            <Star className="h-3.5 w-3.5" /> Proven Performers
          </div>
          <h2 className="font-display text-4xl font-extrabold md:text-5xl text-ink">Consistent Best Sellers</h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground max-w-2xl mx-auto">Products with the highest reorder rates from retailers nationwide.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-4">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* ── OEM / Parallax Banner ── */}
      <section ref={oemRef} className="px-4 py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink text-white premium-shadow-lg relative">
          
          <motion.div style={{ y: oemY }} className="absolute inset-0 opacity-40 pointer-events-none">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200')] bg-cover bg-center mix-blend-luminosity" />
             <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
          </motion.div>

          <div className="grid md:grid-cols-2 items-center relative z-10">
            <div className="p-10 md:p-16 lg:p-24">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 glass-dark px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-8">
                <Factory className="h-3.5 w-3.5 text-gold" /> Original Equipment Manufacturer
              </div>
              <h2 className="font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-[1.1]">
                Your Brand.<br/><span className="text-primary">Our Factory.</span>
              </h2>
              <p className="mt-6 text-cream/90 text-lg max-w-md font-medium leading-relaxed">
                Launch your own footwear brand. Full private label services from custom moulds to branded retail boxes. Minimum 300 pairs per style.
              </p>
              <ul className="mt-10 space-y-4">
                {['Custom Logo Embossing', 'Branded Insoles & Hangtags', 'Retail Box Printing', 'Color Customization'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-bold tracking-wide">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-12">
                <Link to="/bulk-order" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-ink hover:bg-cream hover:scale-105 transition-transform shadow-xl">
                  Discuss Private Label <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex h-full w-full items-center justify-center p-12">
              <div className="relative w-full aspect-square max-w-[400px] rounded-3xl border border-white/10 glass flex flex-col items-center justify-center p-10 text-center premium-shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                 <Package className="relative h-28 w-28 text-ink mb-8 animate-float" strokeWidth={1} />
                 <h3 className="relative font-display text-3xl font-extrabold text-ink">End-to-End</h3>
                 <p className="relative mt-2 text-sm font-bold text-ink/70 tracking-widest uppercase">Manufacturing</p>
                 <div className="relative mt-6 flex items-center gap-2 text-[10px] font-bold text-ink/50 uppercase">
                    <span>Sample</span> <ArrowRight className="w-3 h-3"/> <span>Production</span> <ArrowRight className="w-3 h-3"/> <span>Dispatch</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </SiteLayout>
  );
}

// Helper for category grid
function CategoryBlock({ c, large = false }: { c: any, large?: boolean }) {
  return (
    <Link
      to="/products"
      search={{ category: c.slug, gender: undefined }}
      className={`group relative block w-full overflow-hidden rounded-3xl bg-black ${large ? 'h-[400px] md:h-full min-h-[400px]' : 'h-[300px]'}`}
    >
      <img 
        src={c.image} 
        alt={c.name} 
        className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-40 mix-blend-luminosity group-hover:mix-blend-normal"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <h3 className={`font-display font-extrabold text-white leading-tight ${large ? 'text-4xl sm:text-5xl' : 'text-3xl'}`}>{c.name}</h3>
        <div className="mt-3 flex items-center gap-3 opacity-0 transform translate-y-4 transition duration-500 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {c.productCount} Products
          </span>
          <span className="text-white text-sm font-bold flex items-center gap-1">Shop Now <ArrowRight className="w-4 h-4"/></span>
        </div>
      </div>
    </Link>
  );
}
