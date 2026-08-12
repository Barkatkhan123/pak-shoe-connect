import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  MessageCircle,
  FileText,
  Zap,
  Check,
  Loader2,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";
import type { PricingCalculation } from "@/hooks/usePricingCalculator";
import { toast } from "sonner";
import { waLink } from "@/lib/site";

interface PurchaseActionsProps {
  product: EnterpriseProduct;
  pricing: PricingCalculation;
  selectedColor: string;
  selectedSize: string;
  isAssorted: boolean;
  onAddToCart: () => void;
  onOpenRfq?: () => void;
}

export function PurchaseActions({
  product,
  pricing,
  selectedColor,
  selectedSize,
  isAssorted,
  onAddToCart,
  onOpenRfq,
}: PurchaseActionsProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { quantity, unitPrice, subtotal, currency } = pricing;

  const handleAddWithFeedback = () => {
    setLoading(true);
    setTimeout(() => {
      onAddToCart();
      setLoading(false);
      setSuccess(true);
      toast.success(`Added ${quantity} pairs of ${product.title} to Inquiry Basket!`, {
        description: `Color: ${selectedColor} • Rate: ${currency} ${unitPrice}/pair`,
      });
      setTimeout(() => setSuccess(false), 2500);
    }, 400);
  };

  const handleDirectWhatsApp = () => {
    const sizeText = isAssorted ? "Standard Assorted Ratio (12 prs/ctn)" : `Size EU ${selectedSize}`;
    const text = encodeURIComponent(
      `Assalam-o-Alaikum, I want to place a wholesale order/inquiry on SherSha:\n\n` +
      `📦 Product: ${product.title}\n` +
      `🏷️ SKU: ${product.sku}\n` +
      `🎨 Color: ${selectedColor}\n` +
      `📏 Size Run: ${sizeText}\n` +
      `🔢 Quantity: ${quantity} pairs (${pricing.cartonsCount} cartons)\n` +
      `💰 Unit Rate: ${currency} ${unitPrice.toLocaleString()}/pair\n` +
      `💵 Estimated Total: ${currency} ${subtotal.toLocaleString()}\n\n` +
      `Please confirm stock availability & dispatch schedule.`
    );
    window.open(`https://wa.me/923001234567?text=${text}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Primary CTA: Add to Inquiry Basket / Cart ── */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleAddWithFeedback}
        disabled={loading}
        className={`relative flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl px-6 font-black text-base shadow-xl transition-all ${
          success
            ? "bg-emerald-600 text-white shadow-emerald-600/30"
            : "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/25"
        }`}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Updating Basket...</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Check className="h-5 w-5 stroke-[3]" />
              <span>Added to Inquiry Basket!</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add {quantity} Pairs to Inquiry Basket • {currency} {subtotal.toLocaleString()}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Secondary B2B Action Buttons ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* WhatsApp Direct Negotiation */}
        <button
          type="button"
          onClick={handleDirectWhatsApp}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp Supplier</span>
        </button>

        {/* Request RFQ Custom Quotation */}
        <button
          type="button"
          onClick={onOpenRfq || handleDirectWhatsApp}
          className="flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-secondary/60 px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary transition-all shadow-sm"
        >
          <FileText className="h-4 w-4 text-amber-500" />
          <span>Request Custom RFQ</span>
        </button>
      </div>
    </div>
  );
}
