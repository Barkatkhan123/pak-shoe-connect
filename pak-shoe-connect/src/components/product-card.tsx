import { Link } from "@tanstack/react-router";
import { Heart, Eye, Star, Zap, TrendingUp, Sparkles, Plus, Check, ImageOff } from "lucide-react";
import type { Product } from "@/data/products";
import { useWishlist } from "@/hooks/use-wishlist";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useState, useMemo } from "react";

type Props = {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
};

const BADGE_CONFIG = {
  bestseller: { label: "Best Seller", icon: Star, color: "bg-[#C9A84C] text-[#0F1A13]" },
  trending: { label: "Trending", icon: TrendingUp, color: "bg-rose-600 text-white" },
  newArrival: { label: "New", icon: Sparkles, color: "bg-[#1B4332] text-[#FAF7F2]" },
  featured: { label: "Featured", icon: Zap, color: "bg-amber-600 text-white" },
};

export function ProductCard({ product, index = 0, onQuickView }: Props) {
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, isInBasket, isAdding } = useInquiryBasket();
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const wishlisted = isWishlisted(product.slug);
  const inBasket = isInBasket(product.slug);

  // Single badge priority
  const badge = product.bestseller
    ? BADGE_CONFIG.bestseller
    : product.trending
      ? BADGE_CONFIG.trending
      : product.newArrival
        ? BADGE_CONFIG.newArrival
        : product.featured
          ? BADGE_CONFIG.featured
          : null;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 4.8;

  // Normalized low -> high wholesale price
  const { minPrice, maxPrice, formattedPrice } = useMemo(() => {
    if (!product.priceTiers || product.priceTiers.length === 0) {
      return { minPrice: 0, maxPrice: 0, formattedPrice: product.priceLabel || "PKR Quote on Request" };
    }
    const prices = product.priceTiers.map((t) => t.pricePerPair).sort((a, b) => a - b);
    const min = prices[0] ?? 0;
    const max = prices[prices.length - 1] ?? 0;
    const formatted =
      min === max
        ? `PKR ${min.toLocaleString()}`
        : `PKR ${min.toLocaleString()} – ${max.toLocaleString()}`;
    return { minPrice: min, maxPrice: max, formattedPrice: formatted };
  }, [product.priceTiers, product.priceLabel]);

  return (
    <div className="group relative flex flex-col product-card-premium h-full bg-white rounded-xl border border-[#E0D9CE] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      {/* ── Top Badge (Max One) ── */}
      {badge && (
        <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-xs ${badge.color}`}
          >
            <badge.icon className="h-2.5 w-2.5 shrink-0" />
            {badge.label}
          </span>
        </div>
      )}

      {/* ── Wishlist Heart (Accessible 44px touch target) ── */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleItem(product);
        }}
        className={`absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90 ${
          wishlisted ? "text-rose-500" : "text-foreground/40 hover:text-rose-500"
        }`}
        aria-label={
          wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-[#E0D9CE]">
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-rose-500 text-rose-500" : "text-foreground/60"}`}
          />
        </span>
      </button>

      {/* ── 4:5 Aspect Ratio Image Container with Skeleton & Fallback ── */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        search={{ category: undefined, gender: undefined }}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-[#F5EFE4] shrink-0"
      >
        {/* Skeleton shimmer while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-[#E0D9CE]/60 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Anamon
            </span>
          </div>
        )}

        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#F5EFE4] text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#E0D9CE]/60 text-[#8B5E3C] mb-1.5">
              <ImageOff className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wide">
              {product.name}
            </span>
            <span className="text-[9px] text-muted-foreground">Footwear Showcase</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={400}
            height={500}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            className={`h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Quick View Button (Desktop Hover Overlay + Mobile Touch Icon) */}
        {onQuickView && (
          <>
            <div className="hidden lg:flex absolute inset-0 items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/95 text-foreground px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-md transition-transform hover:scale-105 border border-[#E0D9CE] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> Quick View
              </button>
            </div>

            {/* Mobile Touch Quick View Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="lg:hidden absolute left-2 bottom-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-[#E0D9CE] text-[#0F1A13] hover:text-[#1B4332] active:scale-90 transition-transform cursor-pointer"
              aria-label={`Quick view ${product.name}`}
              title="Quick View Details"
            >
              <Eye className="h-3.5 w-3.5 text-[#0F1A13]" />
            </button>
          </>
        )}
      </Link>

      {/* ── Product Details Area ── */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 bg-white relative">
        {/* Color Swatches (Max 4 + count) */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            {product.colorVariants.slice(0, 4).map((cv) => (
              <button
                key={cv.name}
                type="button"
                title={cv.name}
                onMouseEnter={() => setHoveredColor(cv.name)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border transition-transform ${
                  hoveredColor === cv.name ? "scale-125 border-[#1B4332]" : "border-black/20"
                }`}
                style={{ backgroundColor: cv.hex }}
                aria-label={`Color ${cv.name}`}
              />
            ))}
            {product.colorVariants.length > 4 && (
              <span className="text-[9px] font-bold text-muted-foreground ml-0.5">
                +{product.colorVariants.length - 4}
              </span>
            )}
          </div>
        )}

        {/* SKU (Uppercase, Muted, 11px) */}
        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] mb-0.5 truncate">
          {product.sku || "ANM-FTW"}
        </div>

        {/* Product Title (2-Line Clamp with Consistent Height) */}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          search={{ category: undefined, gender: undefined }}
          className="group-hover:text-[#1B4332] transition-colors"
        >
          <h3 className="line-clamp-2 font-display text-[12px] sm:text-[15px] font-bold leading-tight text-[#0F1A13] min-h-[1.9rem] sm:min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating + Review Count */}
        <div className="mt-1 sm:mt-1.5 flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < Math.round(avgRating) ? "fill-[#C9A84C] text-[#C9A84C]" : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
            ({reviews.length || 8})
          </span>
        </div>

        <div className="flex-1 min-h-[4px] sm:min-h-[6px]" />

        {/* Price Line (Normalized Low -> High + /pair suffix) */}
        <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-[#E0D9CE]/70">
          <div className="font-sans text-xs sm:text-base font-extrabold text-[#1B4332] tracking-tight">
            {formattedPrice}{" "}
            <span className="text-[9px] sm:text-xs font-semibold text-muted-foreground">
              / pair
            </span>
          </div>

          {/* Compact Metadata Chips Row (No Wrapping Glitches) */}
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-semibold text-[#5C6B5A] flex-wrap sm:flex-nowrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E0D9CE] truncate">
              MOQ {product.moq}
            </span>
            <span className="text-[#E0D9CE]">·</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E0D9CE] truncate">
              Lead {product.leadTimeDays || "3–5 d"}
            </span>
          </div>
        </div>

        {/* Action Button: Add to Inquiry */}
        <div className="mt-2.5 sm:mt-3">
          <button
            onClick={() => addItem(product)}
            disabled={inBasket || isAdding}
            className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-xs min-h-[34px] sm:min-h-[38px] ${
              inBasket
                ? "bg-[#FAF7F2] text-[#1B4332] border border-[#1B4332]/30 cursor-default"
                : "bg-[#1B4332] text-white hover:bg-[#C9A84C] hover:text-[#0F1A13] active:scale-98 cursor-pointer"
            }`}
            aria-label={`Add ${product.name} to inquiry basket`}
          >
            {inBasket ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1B4332]" />
                <span>In Basket</span>
              </>
            ) : isAdding ? (
              <span>Adding...</span>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Add to Inquiry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
