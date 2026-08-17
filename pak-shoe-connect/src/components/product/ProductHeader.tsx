import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  X,
  BadgeCheck,
  Star,
  Check,
  Copy,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";
import { toast } from "sonner";

interface ProductHeaderProps {
  product: EnterpriseProduct;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onClose: () => void;
}

export function ProductHeader({
  product,
  isWishlisted,
  onToggleWishlist,
  onClose,
}: ProductHeaderProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/products/${product.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Product link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
      setShowShareMenu(false);
    });
  };

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/products/${product.slug}`;
    const text = encodeURIComponent(
      `Check out ${product.title} on Anamon B2B Marketplace:\n${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setShowShareMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-white/95 px-6 py-4 backdrop-blur-md dark:bg-neutral-900/95">
      {/* ── Left: Title & Identity ── */}
      <div className="flex flex-col gap-1 pr-4 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified Manufacturer
          </span>
          <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
          <span className="hidden sm:inline-block text-xs text-muted-foreground">
            • {product.supplier.location.split(",")[0]}
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <h1
            id="product-title"
            className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate max-w-xl"
          >
            {product.title}
          </h1>
          {product.nameUrdu && (
            <span className="hidden lg:inline text-sm font-medium text-muted-foreground font-urdu opacity-80">
              {product.nameUrdu}
            </span>
          )}
        </div>

        {/* Rating and orders summary */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{product.stats.rating}</span>
            <span className="text-muted-foreground font-normal">
              ({product.stats.totalReviews} reviews)
            </span>
          </div>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {product.stats.ordersCompleted}+ Bulk Orders Delivered
          </span>
        </div>
      </div>

      {/* ── Right: Action Toolbar ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
            isWishlisted
              ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
              : "border-border/60 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
            }`}
          />
        </motion.button>

        {/* Share Button & Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowShareMenu(!showShareMenu)}
            aria-label="Share product"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-secondary/50 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border/80 bg-white p-2 shadow-2xl backdrop-blur-xl dark:bg-neutral-900"
              >
                <div className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Share Product
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{copied ? "Link Copied!" : "Copy Share Link"}</span>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>Share on WhatsApp</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          aria-label="Close modal"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-secondary/70 text-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </div>
    </header>
  );
}
