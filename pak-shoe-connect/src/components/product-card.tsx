import { Link } from "@tanstack/react-router";
import { Heart, Eye, Star, Zap, TrendingUp, Sparkles, Plus } from "lucide-react";
import type { Product } from "@/data/products";
import { useWishlist } from "@/hooks/use-wishlist";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useState } from "react";

type Props = {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
};

const BADGE_CONFIG = {
  bestseller: { label: "Best Seller", icon: Star, color: "bg-amber-500 text-white" },
  trending: { label: "Trending", icon: TrendingUp, color: "bg-rose-500 text-white" },
  newArrival: { label: "New", icon: Sparkles, color: "bg-blue-600 text-white" },
  featured: { label: "Featured", icon: Zap, color: "bg-violet-600 text-white" },
};

export function ProductCard({ product, index = 0, onQuickView }: Props) {
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, isInBasket } = useInquiryBasket();
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  
  const wishlisted = isWishlisted(product.slug);
  const inBasket = isInBasket(product.slug);

  const badge = product.bestseller
    ? BADGE_CONFIG.bestseller
    : product.trending
    ? BADGE_CONFIG.trending
    : product.newArrival
    ? BADGE_CONFIG.newArrival
    : product.featured
    ? BADGE_CONFIG.featured
    : null;

  const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="group relative flex flex-col product-card-premium h-full">
      {/* ── Badges ── */}
      {badge && (
        <div className={`absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm animate-badge-pop ${badge.color}`}>
          <badge.icon className="h-2.5 w-2.5" />
          {badge.label}
        </div>
      )}

      {/* ── Wishlist Heart ── */}
      <button
        onClick={(e) => { e.preventDefault(); toggleItem(product); }}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full glass shadow-sm transition-transform duration-300 hover:scale-110 ${
          wishlisted ? "text-rose-500" : "text-foreground/40 hover:text-rose-500"
        }`}
        aria-label="Wishlist"
      >
        <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
      </button>

      {/* ── Image & Hover Overlay ── */}
      <Link to="/products/$slug" params={{ slug: product.slug }} search={{ category: undefined, gender: undefined }} className="block overflow-hidden relative bg-cream">
        <div className="aspect-[4/5] w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="product-img h-full w-full object-cover mix-blend-multiply"
          />
        </div>
        
        {/* Quick View Button (Desktop) */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="pointer-events-auto flex items-center gap-2 rounded-full glass px-5 py-2.5 text-xs font-bold text-foreground shadow-lg backdrop-blur-md transition-transform hover:scale-105"
            >
              <Eye className="h-4 w-4" /> Quick View
            </button>
          </div>
        )}
      </Link>

      {/* ── Info Area ── */}
      <div className="flex flex-1 flex-col p-4 bg-white relative">
        
        {/* Swatches (floating above content on hover or static if preferred) */}
        {product.colorVariants.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3">
            {product.colorVariants.slice(0, 4).map((cv) => (
              <button
                key={cv.name}
                title={cv.name}
                onMouseEnter={() => setHoveredColor(cv.name)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`h-4 w-4 rounded-full border-2 transition-transform duration-200 ${
                  !cv.inStock ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                } ${hoveredColor === cv.name ? "border-primary scale-125" : "border-white"}`}
                style={{ backgroundColor: cv.hex, boxShadow: "0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(0,0,0,0.1)" }}
              />
            ))}
            {product.colorVariants.length > 4 && (
              <span className="text-[10px] font-semibold text-muted-foreground ml-1">
                +{product.colorVariants.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Title & SKU */}
        <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {product.sku}
        </div>
        <Link to="/products/$slug" params={{ slug: product.slug }} search={{ category: undefined, gender: undefined }}>
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-[1.25] text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.round(avgRating) ? "fill-gold text-gold" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">({product.reviews.length})</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price & MOQ */}
        <div className="mt-4 flex items-end justify-between border-t border-border/50 pt-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
              MOQ {product.moq} pairs
            </div>
            <div className="font-sans text-lg font-black tracking-tight text-primary">
              {product.priceLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-emerald-deep bg-emerald-deep/5 px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
              Lead Time
            </div>
            <div className="text-xs font-semibold text-foreground/80">{product.leadTimeDays}</div>
          </div>
        </div>

        {/* ── Slide-up Hover CTA ── */}
        <div className="hover-cta absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none flex justify-center items-end h-[60px]">
          <button
            onClick={() => addItem(product)}
            disabled={inBasket}
            className={`pointer-events-auto w-full rounded-xl py-2.5 text-xs font-bold transition-all shadow-lg ${
              inBasket
                ? "bg-muted text-muted-foreground cursor-default"
                : "bg-ink text-white hover:bg-primary"
            }`}
          >
            {inBasket ? "In Inquiry Basket" : <span className="flex items-center justify-center gap-1.5"><Plus className="w-4 h-4"/>Add to Inquiry</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
