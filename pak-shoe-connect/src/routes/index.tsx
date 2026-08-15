import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
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
  ChevronRight,
  Zap,
  Globe,
  Award,
  Users,
  Quote,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

import { SiteLayout } from "@/components/site-layout";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { AnimatedCounter } from "@/components/animated-counter";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/")(
  {
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
  }
);

const HERO_SLIDES = [
  {
    image: CATEGORIES.find((c) => c.slug === "men-peshawari")?.image,
    eyebrow: "Pakistan's #1 Wholesale Hub",
    title: "Source Premium\nFootwear Direct",
    subtitle:
      "Connect directly with verified manufacturers. Handcrafted Peshawari to formal Oxfords — factory pricing, zero middlemen.",
    cta: "Browse Wholesale Catalog",
    ctaSecondary: "Request Quote",
    link: "/products?gender=men",
  },
  {
    image: CATEGORIES.find((c) => c.slug === "women-heels")?.image,
    eyebrow: "Women's Trade Collection",
    title: "Fashion Forward\nWholesale Range",
    subtitle:
      "Fast-moving heels, flats and khussas built for boutiques and retail chains. Consistent stock, reliable margins.",
    cta: "Explore Women's Range",
    ctaSecondary: "Talk to a Trade Specialist",
    link: "/products?gender=women",
  },
  {
    image: CATEGORIES.find((c) => c.slug === "kids-boys")?.image,
    eyebrow: "Institutional Pricing Available",
    title: "School & Kids\nBulk Orders",
    subtitle:
      "Durable school shoes at institutional rates. Flexible MOQ starting at 50 pairs, scaling to thousands.",
    cta: "View Kids Collection",
    ctaSecondary: "Request Samples",
    link: "/products?gender=kids",
  },
];

const bestSellers = PRODUCTS.filter((p) => p.bestseller).slice(0, 4);
const trendingProducts = PRODUCTS.filter((p) => p.trending);

const TESTIMONIALS = [
  {
    name: "Ahmed Farooq",
    role: "Owner, Farooq Traders — Karachi",
    initials: "AF",
    rating: 5,
    text: "Anamon transformed our sourcing completely. Quality is consistent, delivery is on time, and pricing is genuinely wholesale. We've doubled monthly volume since partnering with them.",
  },
  {
    name: "Sana Malik",
    role: "Buyer, Elegance Boutique — Lahore",
    initials: "SM",
    rating: 5,
    text: "The women's collection is outstanding. Our customers love the designs and the wholesale margins are excellent. Recommended for any serious retailer.",
  },
  {
    name: "Zubair Khan",
    role: "Procurement Head, CityMart Chain",
    initials: "ZK",
    rating: 5,
    text: "We source kids' school shoes exclusively through Anamon. The flexible MOQ and private label service helped us launch our own brand. An exceptional B2B partner.",
  },
];

const PROCESS_STEPS = [
  {
    icon: BadgeCheck,
    step: "01",
    title: "Register & Verify",
    desc: "Create your trade account. Business verification takes under 24 hours.",
  },
  {
    icon: Package,
    step: "02",
    title: "Browse & Sample",
    desc: "Request samples before committing to bulk. No sampling fees.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Place Bulk Order",
    desc: "Flexible payment terms — bank transfer, JazzCash, or escrow.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Fast Dispatch",
    desc: "Professionally packed and dispatched within 3–5 working days.",
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Buyer Protection", sub: "100% Quality Assurance", bg: "bg-[#1B4332]" },
  { icon: Truck, label: "Nationwide Delivery", sub: "TCS & Leopards Network", bg: "bg-[#2D6A4F]" },
  { icon: Package, label: "Low MOQ", sub: "Start from 50 pairs", bg: "bg-[#8B5E3C]" },
  { icon: Sparkles, label: "OEM & Private Label", sub: "Your brand, our factory", bg: "bg-[#5C3D1E]" },
  { icon: Globe, label: "Export Ready", sub: "International shipping", bg: "bg-[#1B4332]" },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [heroHovered, setHeroHovered] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const heroRef = useRef(null);
  const oemRef = useRef(null);
  const processRef = useRef(null);
  const statsRef = useRef(null);
  const trendingRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.9], [1, 0]);

  const { scrollYProgress: oemScroll } = useScroll({
    target: oemRef,
    offset: ["start end", "end start"],
  });
  const oemY = useTransform(oemScroll, [0, 1], ["0%", "18%"]);

  const processInView = useInView(processRef, { once: true, margin: "-80px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-80px" });

  const scrollTrending = useCallback((dir: "left" | "right") => {
    if (!trendingRef.current) return;
    trendingRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (heroHovered) return;
    const t = setInterval(
      () => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length),
      7500
    );
    return () => clearInterval(t);
  }, [heroHovered]);

  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length),
      5500
    );
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <SiteLayout>
      {/* ════════════════════════════════════════════════
          HERO — Forest green dark, leather warmth
      ═══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[700px] max-h-[980px] overflow-hidden"
        style={{ background: "#0F1A13" }}
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        {/* Parallax image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.3 } }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              style={{ y: heroImgY }}
              className="absolute inset-0 will-change-transform"
            >
              <img
                src={slide.image}
                alt=""
                className="h-[115%] w-full object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Multi-layer directional overlay — forest green tint */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(105deg, rgba(15,26,19,0.95) 0%, rgba(15,26,19,0.80) 42%, rgba(15,26,19,0.40) 75%, rgba(15,26,19,0.15) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(15,26,19,0.88) 0%, transparent 55%)",
          }}
        />

        {/* Subtle leather-brown warm vignette on left */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 0% 50%, rgba(92,61,30,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Gold accent top-line */}
        <div
          className="absolute top-0 left-0 right-0 z-30 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #8B5E3C 60%, transparent 100%)",
          }}
        />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 pt-20 lg:px-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              {/* Eyebrow pill */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.55 }}
                className="mb-7 inline-flex items-center gap-2.5"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: "#C9A84C", color: "#0F1A13" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {slide.eyebrow}
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="font-display font-extrabold leading-[1.0] text-white drop-shadow-lg text-6xl sm:text-7xl md:text-8xl lg:text-[90px]">
                {slide.title.split("\n").map((line, i) => (
                  <motion.span
                    key={`${currentSlide}-${i}`}
                    className="block"
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.25 + i * 0.12,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {i === 1 ? (
                      <span style={{ color: "#C9A84C" }}>{line}</span>
                    ) : (
                      line
                    )}
                  </motion.span>
                ))}
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="mt-7 max-w-xl text-base font-medium leading-relaxed sm:text-lg"
                style={{ color: "rgba(245,239,228,0.80)" }}
              >
                {slide.subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                <Link
                  to={slide.link as any}
                  className="group inline-flex items-center gap-2.5 rounded-sm px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105"
                  style={{
                    background: "#1B4332",
                    color: "#FAF7F2",
                    border: "1px solid rgba(201,168,76,0.3)",
                    boxShadow: "0 4px 24px rgba(27,67,50,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#C9A84C";
                    (e.currentTarget as HTMLElement).style.color = "#0F1A13";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#1B4332";
                    (e.currentTarget as HTMLElement).style.color = "#FAF7F2";
                  }}
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/bulk-order"
                  className="inline-flex items-center gap-2 rounded-sm px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:bg-white/10"
                  style={{
                    border: "1px solid rgba(245,239,228,0.25)",
                    color: "#F5EFE4",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {slide.ctaSecondary}
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="mt-12 flex items-center gap-5"
              >
                <div className="flex -space-x-2.5">
                  {["AF", "SM", "ZK", "MR", "NA"].map((init, i) => (
                    <div
                      key={i}
                      className="grid h-9 w-9 place-items-center rounded-full text-[10px] font-bold border-2"
                      style={{
                        background: i % 2 === 0 ? "#1B4332" : "#8B5E3C",
                        borderColor: "#0F1A13",
                        color: "#FAF7F2",
                      }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div className="border-l border-white/10 pl-5">
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-current"
                        style={{ color: "#C9A84C" }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-[11px] font-semibold"
                    style={{ color: "rgba(245,239,228,0.55)" }}
                  >
                    Trusted by{" "}
                    <span style={{ color: "#F5EFE4", fontWeight: 700 }}>
                      1,200+
                    </span>{" "}
                    wholesale buyers
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === currentSlide ? "36px" : "8px",
                height: "3px",
                background:
                  i === currentSlide
                    ? "#C9A84C"
                    : "rgba(201,168,76,0.3)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-8 right-10 z-30 hidden lg:flex items-center gap-3">
          <span
            className="font-display text-6xl font-extrabold leading-none"
            style={{ color: "rgba(201,168,76,0.15)" }}
          >
            0{currentSlide + 1}
          </span>
          <div className="h-8 w-px" style={{ background: "rgba(201,168,76,0.15)" }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "rgba(201,168,76,0.4)" }}
          >
            / 03
          </span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TRUST STRIP — warm white bar
      ═══════════════════════════════════════════════ */}
      <section
        style={{ borderBottom: "1px solid #E0D9CE", background: "#FFFFFF" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {TRUST_BADGES.map((t, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div
                  className={`${t.bg} grid h-11 w-11 shrink-0 place-items-center rounded text-white transition-all duration-300 group-hover:scale-110`}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <div
                    className="text-sm font-bold leading-tight"
                    style={{ color: "#0F1A13" }}
                  >
                    {t.label}
                  </div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wide mt-0.5"
                    style={{ color: "#5C6B5A" }}
                  >
                    {t.sub}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          STATS — Forest green dark, gold numbers
      ═══════════════════════════════════════════════ */}
      <section
        ref={statsRef}
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "#1B4332" }}
      >
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Leather vignette right */}
        <div
          className="absolute top-0 right-0 h-full w-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(139,94,60,0.12) 0%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3"
              style={{ color: "#C9A84C" }}
            >
              Our Track Record
            </p>
            <h2
              className="font-display text-4xl font-extrabold md:text-5xl"
              style={{ color: "#FAF7F2" }}
            >
              Built on{" "}
              <span style={{ color: "#C9A84C" }}>25 Years</span> of Trust
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 15000, suffix: "+", label: "Pairs Sold Monthly", icon: Package },
              { value: 1200, suffix: "+", label: "Verified Buyers", icon: Users },
              { value: 25, suffix: "+", label: "Years in Trade", icon: Award },
              { value: 98, suffix: "%", label: "Satisfaction Rate", icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center group"
                initial={{ opacity: 0, y: 28 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div
                  className="mb-5 grid h-14 w-14 place-items-center rounded transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}
                >
                  <stat.icon
                    className="h-6 w-6"
                    style={{ color: "#C9A84C" }}
                  />
                </div>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  delay={i * 120}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TRENDING — Cream background, warm scroll
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{ background: "#FAF7F2" }}
      >
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Header */}
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <motion.div
                className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#8B5E3C" }}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Market Insights
              </motion.div>
              <motion.h2
                className="font-display text-4xl font-extrabold md:text-5xl"
                style={{ color: "#0F1A13" }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
              >
                Trending This Week
              </motion.h2>
              <p
                className="mt-3 text-base font-medium"
                style={{ color: "#5C6B5A" }}
              >
                Fastest-moving SKUs across Pakistani retail right now.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {[{ dir: "left", Icon: ChevronLeft }, { dir: "right", Icon: ChevronRight }].map(({ dir, Icon }) => (
                <button
                  key={dir}
                  onClick={() => scrollTrending(dir as "left" | "right")}
                  className="grid h-10 w-10 place-items-center rounded transition-all duration-300"
                  style={{
                    border: "1px solid #E0D9CE",
                    background: "#FFFFFF",
                    color: "#0F1A13",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#1B4332";
                    (e.currentTarget as HTMLElement).style.color = "#FAF7F2";
                    (e.currentTarget as HTMLElement).style.borderColor = "#1B4332";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
                    (e.currentTarget as HTMLElement).style.color = "#0F1A13";
                    (e.currentTarget as HTMLElement).style.borderColor = "#E0D9CE";
                  }}
                  aria-label={`Scroll ${dir}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
              <Link
                to="/products"
                search={{ category: undefined, gender: undefined }}
                className="ml-2 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                style={{ color: "#1B4332" }}
              >
                View All{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div
            ref={trendingRef}
            className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0"
          >
            {trendingProducts.map((p, i) => (
              <div
                key={p.slug}
                className="min-w-[300px] w-[300px] sm:min-w-[340px] sm:w-[340px] snap-center shrink-0"
              >
                <ProductCard product={p} index={i} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CATEGORIES — Deep forest green mosaic
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{ background: "#0F1A13" }}
      >
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #C9A84C 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gold leather gradient top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C 30%, #8B5E3C 70%, transparent)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <motion.p
                className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#C9A84C" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Full Wholesale Catalog
              </motion.p>
              <motion.h2
                className="font-display text-4xl font-extrabold md:text-5xl leading-tight"
                style={{ color: "#FAF7F2" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 }}
              >
                Shop by<br />
                <span style={{ color: "#C9A84C" }}>Category</span>
              </motion.h2>
            </div>
            <p
              className="max-w-sm text-base font-medium leading-relaxed"
              style={{ color: "rgba(245,239,228,0.55)" }}
            >
              Source exactly what your retail market needs. Every category, every gender, factory pricing.
            </p>
          </div>

          {/* Mosaic grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {CATEGORIES[0] && <CategoryCard c={CATEGORIES[0]} large />}
            </motion.div>
            <div className="md:col-span-5 flex flex-col gap-3 md:gap-4">
              {[CATEGORIES[1], CATEGORIES[2]].map((c, i) =>
                c ? (
                  <motion.div
                    key={c.slug}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 * (i + 1) }}
                  >
                    <CategoryCard c={c} />
                  </motion.div>
                ) : null
              )}
            </div>
            {CATEGORIES.slice(3, 6).map((c, i) => (
              <motion.div
                key={c.slug}
                className="md:col-span-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <CategoryCard c={c} />
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/products"
              search={{ category: undefined, gender: undefined }}
              className="inline-flex items-center gap-2.5 rounded-sm px-10 py-4 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                border: "1px solid rgba(201,168,76,0.35)",
                background: "rgba(201,168,76,0.08)",
                color: "#C9A84C",
              }}
            >
              Browse All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          BEST SELLERS — Warm cream, leather accents
      ═══════════════════════════════════════════════ */}
      <section
        className="relative py-20 md:py-32"
        style={{ background: "#FAF7F2" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(139,94,60,0.08)",
                border: "1px solid rgba(139,94,60,0.2)",
                color: "#5C3D1E",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Award className="h-3.5 w-3.5" style={{ color: "#8B5E3C" }} />
              Proven Performers
            </motion.div>
            <motion.h2
              className="font-display text-4xl font-extrabold md:text-5xl"
              style={{ color: "#0F1A13" }}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Consistent Best Sellers
            </motion.h2>
            <p
              className="mt-4 text-base font-medium max-w-2xl mx-auto"
              style={{ color: "#5C6B5A" }}
            >
              Products with the highest reorder rates from retailers nationwide.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-4">
            {bestSellers.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.6 }}
              >
                <ProductCard product={p} index={i} onQuickView={setQuickViewProduct} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          HOW IT WORKS — White with forest accents
      ═══════════════════════════════════════════════ */}
      <section
        ref={processRef}
        className="relative overflow-hidden py-20 md:py-32"
        style={{
          background: "#FFFFFF",
          borderTop: "1px solid #E0D9CE",
          borderBottom: "1px solid #E0D9CE",
        }}
      >
        {/* Top gold line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C 40%, #8B5E3C 70%, transparent)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#8B5E3C" }}
            >
              Simple 4-Step Process
            </p>
            <h2
              className="font-display text-4xl font-extrabold md:text-5xl"
              style={{ color: "#0F1A13" }}
            >
              How Anamon Works
            </h2>
            <p
              className="mt-4 text-base font-medium max-w-xl mx-auto"
              style={{ color: "#5C6B5A" }}
            >
              From registration to delivery — your wholesale journey made simple.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line desktop */}
            <div
              className="absolute top-[52px] left-[12%] right-[12%] h-px hidden lg:block"
              style={{ background: "linear-gradient(90deg, #E0D9CE, #C9A84C 50%, #E0D9CE)" }}
            />

            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={i}
                className="relative flex flex-col items-center text-center group"
                initial={{ opacity: 0, y: 28 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.13, duration: 0.55 }}
              >
                <div className="relative mb-6">
                  <div
                    className="grid h-[100px] w-[100px] place-items-center rounded transition-all duration-400 group-hover:-translate-y-2"
                    style={{
                      background: "#FAF7F2",
                      border: "1px solid #E0D9CE",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#1B4332";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(27,67,50,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#E0D9CE";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <step.icon className="h-9 w-9 transition-colors group-hover:text-[#1B4332]" style={{ color: "#8B5E3C" }} />
                  </div>
                  <div
                    className="absolute -top-2.5 -right-2.5 grid h-7 w-7 place-items-center rounded-sm text-[11px] font-extrabold"
                    style={{ background: "#1B4332", color: "#C9A84C" }}
                  >
                    {step.step}
                  </div>
                </div>
                <h3
                  className="font-display text-lg font-bold mb-2"
                  style={{ color: "#0F1A13" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed" style={{ color: "#5C6B5A" }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2.5 rounded-sm px-10 py-4 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                background: "#1B4332",
                color: "#FAF7F2",
                boxShadow: "0 4px 20px rgba(27,67,50,0.30)",
              }}
            >
              Start Your Trade Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          OEM / PRIVATE LABEL — Leather dark, parallax
      ═══════════════════════════════════════════════ */}
      <section
        ref={oemRef}
        className="relative overflow-hidden px-4 py-16 md:py-24"
        style={{ background: "#FAF7F2" }}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded"
            style={{ background: "#0F1A13" }}
          >
            {/* Gold top border */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, #1B4332, #C9A84C 40%, #8B5E3C 70%, #1B4332)" }}
            />

            {/* Parallax leather texture background */}
            <motion.div
              style={{ y: oemY }}
              className="absolute inset-0 pointer-events-none"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(105deg, rgba(15,26,19,0.98) 0%, rgba(15,26,19,0.90) 50%, rgba(92,61,30,0.25) 100%)",
              }}
            />

            <div className="relative z-10 grid md:grid-cols-2 items-center">
              {/* Text side */}
              <div className="p-10 md:p-14 lg:p-20">
                <motion.div
                  className="mb-8 inline-flex items-center gap-2.5 rounded-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(201,168,76,0.12)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    color: "#C9A84C",
                  }}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Factory className="h-3.5 w-3.5" /> Original Equipment Manufacturer
                </motion.div>

                <motion.h2
                  className="font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-[1.05]"
                  style={{ color: "#FAF7F2" }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  Your Brand.{" "}
                  <br />
                  <span style={{ color: "#C9A84C" }}>Our Factory.</span>
                </motion.h2>

                <motion.p
                  className="mt-6 text-base max-w-md font-medium leading-relaxed"
                  style={{ color: "rgba(245,239,228,0.72)" }}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.18 }}
                >
                  Launch your own footwear brand. Full private label services from custom moulds to branded retail boxes. Minimum 300 pairs per style.
                </motion.p>

                <motion.ul
                  className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.26 }}
                >
                  {[
                    "Custom Logo Embossing",
                    "Branded Insoles & Hangtags",
                    "Retail Box Printing",
                    "Color Customization",
                    "Custom Moulds",
                    "Exclusive Designs",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm font-semibold"
                      style={{ color: "rgba(245,239,228,0.75)" }}
                    >
                      <div
                        className="grid h-5 w-5 shrink-0 place-items-center rounded-sm"
                        style={{ background: "rgba(201,168,76,0.20)" }}
                      >
                        <Check className="h-3 w-3" style={{ color: "#C9A84C" }} />
                      </div>
                      {f}
                    </li>
                  ))}
                </motion.ul>

                <motion.div
                  className="mt-10 flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.34 }}
                >
                  <Link
                    to="/bulk-order"
                    className="group inline-flex items-center gap-2 rounded-sm px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105"
                    style={{
                      background: "#C9A84C",
                      color: "#0F1A13",
                      boxShadow: "0 4px 20px rgba(201,168,76,0.30)",
                    }}
                  >
                    Discuss Private Label{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/manufacturing"
                    className="inline-flex items-center gap-2 rounded-sm px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-300"
                    style={{
                      border: "1px solid rgba(245,239,228,0.18)",
                      color: "#F5EFE4",
                    }}
                  >
                    View Manufacturing
                  </Link>
                </motion.div>
              </div>

              {/* Right — feature card */}
              <div className="hidden md:flex items-center justify-center p-12">
                <motion.div
                  className="relative w-full max-w-[360px] aspect-square rounded flex flex-col items-center justify-center p-10 text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(139,94,60,0.08) 100%)",
                    border: "1px solid rgba(201,168,76,0.20)",
                  }}
                  initial={{ opacity: 0, scale: 0.92, rotate: 3 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Inner glow */}
                  <div
                    className="absolute inset-0 rounded"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)",
                    }}
                  />
                  <div
                    className="mb-6 grid h-20 w-20 place-items-center rounded"
                    style={{
                      background: "rgba(201,168,76,0.12)",
                      border: "1px solid rgba(201,168,76,0.25)",
                    }}
                  >
                    <Package
                      className="h-10 w-10"
                      style={{ color: "#C9A84C" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3
                    className="font-display text-2xl font-extrabold mb-1"
                    style={{ color: "#FAF7F2" }}
                  >
                    End-to-End
                  </h3>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-8"
                    style={{ color: "rgba(201,168,76,0.50)" }}
                  >
                    Manufacturing
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase" style={{ color: "rgba(201,168,76,0.40)" }}>
                    {["Sample", "Production", "Dispatch"].map((s, i, arr) => (
                      <React.Fragment key={s}>
                        <span
                          className="rounded-sm px-2.5 py-1"
                          style={{ background: "rgba(201,168,76,0.10)", color: "rgba(201,168,76,0.65)" }}
                        >
                          {s}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="h-3 w-3" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          TESTIMONIALS — Parchment warm background
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{ background: "#F5EFE4" }}
      >
        {/* Leather diagonal accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #8B5E3C 30%, #C9A84C 60%, transparent)" }}
        />

        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#8B5E3C" }}
            >
              Client Stories
            </p>
            <h2
              className="font-display text-4xl font-extrabold md:text-5xl"
              style={{ color: "#0F1A13" }}
            >
              What Buyers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className="relative rounded p-8 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "#FFFFFF",
                  border: i === activeTestimonial ? "1px solid #1B4332" : "1px solid #E0D9CE",
                  boxShadow:
                    i === activeTestimonial
                      ? "0 8px 32px rgba(27,67,50,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.04)",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
              >
                {/* Gold quote mark */}
                <div
                  className="mb-5 font-display text-5xl font-extrabold leading-none"
                  style={{ color: "rgba(201,168,76,0.25)" }}
                >
                  "
                </div>
                <p
                  className="text-sm font-medium leading-relaxed mb-6"
                  style={{ color: "#2D3A2A" }}
                >
                  {t.text}
                </p>
                <div
                  className="flex items-center gap-3 pt-5"
                  style={{ borderTop: "1px solid #E0D9CE" }}
                >
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded text-sm font-bold"
                    style={{
                      background: i % 2 === 0 ? "#1B4332" : "#8B5E3C",
                      color: "#FAF7F2",
                    }}
                  >
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "#0F1A13" }}>
                      {t.name}
                    </div>
                    <div className="text-[11px] font-medium truncate" style={{ color: "#5C6B5A" }}>
                      {t.role}
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-current" style={{ color: "#C9A84C" }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FINAL CTA — Forest green, maximum trust
      ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "#1B4332" }}
      >
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Leather accent radial */}
        <div
          className="absolute top-0 right-0 h-full w-1/2 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 100% 50%, rgba(139,94,60,0.20) 0%, transparent 65%)",
          }}
        />
        {/* Gold line top */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C 35%, #8B5E3C 70%, transparent)" }}
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.28)",
                color: "#C9A84C",
              }}
            >
              <BadgeCheck className="h-4 w-4" /> B2B Verified Wholesale Platform
            </div>
            <h2
              className="font-display text-4xl font-extrabold leading-[1.08] md:text-6xl mb-6"
              style={{ color: "#FAF7F2" }}
            >
              Ready to Source at{" "}
              <span style={{ color: "#C9A84C" }}>Wholesale Prices?</span>
            </h2>
            <p
              className="text-base font-medium max-w-2xl mx-auto mb-10"
              style={{ color: "rgba(245,239,228,0.68)" }}
            >
              Join over 1,200 verified wholesale buyers across Pakistan. Direct from factory. No middlemen.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2.5 rounded-sm px-10 py-4 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105"
                style={{
                  background: "#C9A84C",
                  color: "#0F1A13",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
                }}
              >
                Create Free Trade Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                search={{ category: undefined, gender: undefined }}
                className="inline-flex items-center gap-2 rounded-sm px-10 py-4 text-sm font-bold tracking-wide transition-all duration-300"
                style={{
                  border: "1px solid rgba(245,239,228,0.22)",
                  color: "#F5EFE4",
                }}
              >
                Browse Catalog
              </Link>
            </div>

            {/* Contact band */}
            <div
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm font-medium"
              style={{ color: "rgba(245,239,228,0.45)" }}
            >
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: "#C9A84C" }} />
                +92 300 000 0000
              </span>
              <span className="h-4 w-px" style={{ background: "rgba(245,239,228,0.15)" }} />
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: "#C9A84C" }} />
                Lahore, Pakistan
              </span>
              <span className="h-4 w-px" style={{ background: "rgba(245,239,228,0.15)" }} />
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: "#C9A84C" }} />
                Mon–Sat, 9am–6pm PKT
              </span>
            </div>
          </motion.div>
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

// Category card helper
function CategoryCard({ c, large = false }: { c: any; large?: boolean }) {
  return (
    <Link
      to="/products"
      search={{ category: c.slug, gender: undefined }}
      className={`group relative block w-full overflow-hidden ${large ? "h-[440px] md:h-full min-h-[440px]" : "h-[270px]"}`}
      style={{ borderRadius: "4px" }}
    >
      <img
        src={c.image}
        alt={c.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108 opacity-80 group-hover:opacity-65"
        style={{ transform: "scale(1)" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
      {/* Forest green directional overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(to top, rgba(15,26,19,0.95) 0%, rgba(15,26,19,0.40) 50%, rgba(15,26,19,0.10) 100%)",
        }}
      />
      {/* Gold top accent on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: "linear-gradient(90deg, #C9A84C, #8B5E3C)" }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div
          className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(201,168,76,0.70)" }}
        >
          {c.productCount} Products
        </div>
        <h3
          className={`font-display font-extrabold leading-tight text-white ${large ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}
        >
          {c.name}
        </h3>
        <div className="mt-3 flex items-center gap-2 translate-y-2 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
          <span
            className="inline-flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "#1B4332", color: "#C9A84C" }}
          >
            Shop Now <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
