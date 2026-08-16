import { Product } from "@/data/products";
import { formatPKR, waLink } from "@/lib/site";
import { ShieldCheck, MessageCircle, Factory, Truck, RefreshCcw, CreditCard, ChevronRight, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";

interface PurchasePanelProps {
  product: Product;
  totalPairs: number;
  totalAmount: number;
  selectedColor: string;
}

export function PurchasePanel({ product, totalPairs, totalAmount, selectedColor }: PurchasePanelProps) {
  const { addItem, isAdding } = useInquiryBasket();
  const moqMet = totalPairs >= product.moq;
  const isMultipleOf12 = totalPairs > 0 && totalPairs % 12 === 0;
  const isValidOrder = moqMet && isMultipleOf12;

  const handleSendInquiry = () => {
    if (!isValidOrder) return;
    addItem(product, {
      color: selectedColor,
      qty: totalPairs,
      size: "Assorted Carton Ratio (12 prs/ctn)",
    });
  };

  const handleRequestSample = () => {
    const samplePrice = product.priceTiers?.[0]?.pricePerPair || 1850;
    const msg = `Assalam-o-Alaikum Anamon Team,\nI want to order 1 Sample Pair for quality inspection:\n\n*Product:* ${product.name} (SKU: ${product.sku})\n*Color:* ${selectedColor}\n*Quantity:* 1 Sample Pair\n*Sample Price:* ${formatPKR(samplePrice)}\n\nPlease provide dispatch address & payment account details.`;
    window.open(waLink(msg), "_blank");
  };

  const handleWhatsApp = () => {
    const msg = `Hi Anamon, I am interested in wholesale inquiry for:\n\n*${product.name}* (SKU: ${product.sku})\nColor: ${selectedColor} (Single color per carton)\nTotal Pairs: ${totalPairs} (${totalPairs / 12} Cartons)\n\nPlease send pricing details.`;
    window.open(waLink(msg), "_blank");
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-border premium-shadow glass bg-background/80 p-6 flex flex-col gap-6">
      
      {/* Product Page MOQ Short Format Summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between font-bold text-primary border-b border-primary/10 pb-1.5">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Package className="h-4 w-4" /> Order Policy
          </span>
          <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded font-mono">1 Carton = 12 Pairs</span>
        </div>
        <div className="space-y-1 text-muted-foreground">
          <div><strong className="text-foreground">Minimum Order:</strong> 12 pairs (1 carton)</div>
          <div><strong className="text-foreground">Packing:</strong> 12 pairs per carton</div>
          <div><strong className="text-foreground">Order Quantity:</strong> Multiples of 12 pairs only</div>
          <div><strong className="text-foreground">Sample Order:</strong> 1 sample pair can also be ordered</div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-muted-foreground">Order Summary</h3>
        <div className="flex justify-between items-end">
          <span className="text-lg font-medium text-foreground">
            {totalPairs} Pairs {totalPairs > 0 && `(${Math.floor(totalPairs / 12)} Ctn${Math.floor(totalPairs / 12) === 1 ? "" : "s"})`}
          </span>
          <span className="font-display text-3xl gradient-text font-semibold">{formatPKR(totalAmount)}</span>
        </div>
        {!moqMet && totalPairs > 0 && (
          <div className="text-xs text-destructive font-medium mt-1">
            Minimum bulk order quantity is {product.moq} pairs (1 carton).
          </div>
        )}
        {moqMet && !isMultipleOf12 && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            Orders must be placed in multiples of 12 pairs (12, 24, 36, etc.).
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleSendInquiry}
          disabled={!isValidOrder || isAdding}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-sm cursor-pointer"
        >
          {isAdding ? "Adding to Basket..." : "Send Bulk Inquiry"}
        </Button>
        <Button 
          variant="outline"
          onClick={handleRequestSample}
          className="w-full h-12 rounded-xl border-[#C9A84C] text-[#0F1A13] dark:text-[#C9A84C] hover:bg-[#C9A84C]/10 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          Order 1 Sample Pair ({formatPKR(product.priceTiers?.[0]?.pricePerPair || 1850)})
        </Button>
        <Button 
          variant="secondary"
          className="w-full h-12 rounded-xl bg-whatsapp text-white hover:bg-whatsapp/90 animate-pulse-ring text-base relative overflow-hidden group"
          onClick={handleWhatsApp}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </span>
        </Button>
      </div>

      {/* B2B Assurance Points */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <Truck className="w-4 h-4 text-primary shrink-0" />
          <span>Dispatch via Goods Transport (Bilti) in 24-48h</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>Factory direct price with GST invoice</span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCcw className="w-4 h-4 text-primary shrink-0" />
          <span>Defect replacement guarantee per carton</span>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-primary shrink-0" />
          <span>Advance bank transfer / Cash on Delivery terms</span>
        </div>
      </div>

    </div>
  );
}
