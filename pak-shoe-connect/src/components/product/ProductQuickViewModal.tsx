import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Product as LegacyProduct } from "@/data/products";
import { type EnterpriseProduct, normalizeEnterpriseProduct } from "@/types/product";
import { usePricingCalculator } from "@/hooks/usePricingCalculator";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useWishlist } from "@/hooks/use-wishlist";

import { ProductHeader } from "./ProductHeader";
import { MediaGallery } from "./MediaGallery";
import { PricingSection } from "./PricingSection";
import { BulkPricingTable } from "./BulkPricingTable";
import { MOQInfoCard } from "@/components/moq-info-card";
import { VariantSelector } from "./VariantSelector";
import { SizeMatrix } from "./SizeMatrix";
import { QuantitySelector } from "./QuantitySelector";
import { PurchaseActions } from "./PurchaseActions";
import { ProductTabs } from "./ProductTabs";
import { TrustFooter } from "./TrustFooter";

interface ProductQuickViewModalProps {
  product: LegacyProduct | EnterpriseProduct | null;
  isOpen?: boolean;
  onClose: () => void;
}

export function ProductQuickViewModal({
  product: rawProduct,
  isOpen = true,
  onClose,
}: ProductQuickViewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize legacy or enterprise product format
  const product: EnterpriseProduct | null = rawProduct
    ? "supplier" in rawProduct && "media" in rawProduct
      ? (rawProduct as EnterpriseProduct)
      : normalizeEnterpriseProduct(rawProduct as LegacyProduct)
    : null;

  const { addItem: addToBasket } = useInquiryBasket();
  const { toggleItem: toggleWishlist, isWishlisted: checkWishlist } = useWishlist();

  // Local state for product customization
  const [selectedColor, setSelectedColor] = useState<string>("Default");
  const [selectedColorImage, setSelectedColorImage] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string>("8");
  const [isAssortedRatio, setIsAssortedRatio] = useState(true);
  const [quantity, setQuantity] = useState<number>(12);

  // Reset when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.variants.colors[0]?.name || "Default");
      setSelectedColorImage(product.variants.colors[0]?.image);
      setSelectedSize(product.variants.sizes[0]?.UK || product.variants.sizes[0]?.EU || "8");
      setIsAssortedRatio(true);
      setQuantity(product.inventory.moq || 12);
    }
  }, [product?.slug]);

  // Pricing calculator hook
  const pricing = usePricingCalculator(product, quantity);
  const isWishlisted = product ? checkWishlist(product.slug) : false;

  // Keyboard accessibility: Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen && product) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    }
  }, [isOpen, product]);

  if (!mounted || typeof document === "undefined") return null;

  const handleColorChange = (name: string, img?: string) => {
    setSelectedColor(name);
    setSelectedColorImage(img);
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Always build from the normalised enterprise product so fields are guaranteed
    const basketItem = {
      // If rawProduct is already a proper LegacyProduct, spread it; otherwise build from enterprise shape
      ...(rawProduct as LegacyProduct),
      slug: product.slug,
      name: product.title,
      sku: product.sku,
      image: product.media.mainImage,
      moq: product.inventory.moq || 12,
      priceLabel: `PKR ${pricing.unitPrice.toLocaleString()}/pair`,
      colors: product.variants.colors.map((c) => c.name),
      sizes: product.variants.sizes.map((s) => ({
        EU: s.EU,
        UK: s.UK,
        label: s.UK ? `Size ${s.UK}` : s.EU,
      })),
      priceTiers: product.bulkPricing.map((tier) => ({
        moq: tier.minQuantity,
        pricePerPair: tier.unitPrice,
        label: tier.label,
      })),
    } as unknown as LegacyProduct;

    addToBasket(basketItem, {
      color: selectedColor,
      size: isAssortedRatio ? "Assorted Carton Ratio" : selectedSize,
      qty: quantity,
    });
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && product && (
        <div
          key={`quickview-modal-${product.slug}`}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-title"
        >
          {/* ── Backdrop with Blur ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* ── Modal Container ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col w-full max-w-6xl max-h-[92vh] my-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white text-foreground shadow-2xl backdrop-blur-2xl dark:bg-neutral-950 dark:border-neutral-800"
          >
            {/* ── 1. Sticky Header ── */}
            <ProductHeader
              product={product}
              isWishlisted={isWishlisted}
              onToggleWishlist={() => toggleWishlist(rawProduct as LegacyProduct)}
              onClose={onClose}
            />

            {/* ── 2. Scrollable Body: 50/50 Split Layout ── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ── Left Column (Media Gallery & Video Player) - 50% ── */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
                  <MediaGallery product={product} selectedColorImage={selectedColorImage} />
                </div>

                {/* ── Right Column (Purchase Zone, Tiers, Selectors & Tabs) - 50% ── */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
                  {/* Wholesale Pricing Section with Margin Badges */}
                  <PricingSection product={product} pricing={pricing} />

                  {/* Alibaba-style Tiered Bulk Pricing Table */}
                  <BulkPricingTable
                    product={product}
                    pricing={pricing}
                    onSelectTierQuantity={(qty) => setQuantity(qty)}
                  />

                  {/* Product MOQ & Packing Specification Card */}
                  <MOQInfoCard variant="short" />

                  {/* Color Swatch Selector */}
                  <VariantSelector
                    colors={product.variants.colors}
                    selectedColor={selectedColor}
                    onSelectColor={handleColorChange}
                  />

                  {/* Footwear Size Matrix */}
                  <SizeMatrix
                    sizes={product.variants.sizes}
                    selectedSize={selectedSize}
                    onSelectSize={(s) => setSelectedSize(s)}
                    isAssortedRatio={isAssortedRatio}
                    onToggleAssorted={(assorted) => setIsAssortedRatio(assorted)}
                  />

                  {/* Quantity Stepper & Subtotal */}
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={(q) => setQuantity(q)}
                    pricing={pricing}
                  />

                  {/* Prominent High-Converting Call to Action Buttons */}
                  <PurchaseActions
                    product={product}
                    pricing={pricing}
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    isAssorted={isAssortedRatio}
                    onAddToCart={handleAddToCart}
                  />

                  {/* Progressive Disclosure Tabs: Description, Specs, Shipping, Supplier, Reviews */}
                  <div className="pt-4 border-t border-border/80">
                    <ProductTabs product={product} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Sticky Trust Footer ── */}
            <TrustFooter product={product} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
