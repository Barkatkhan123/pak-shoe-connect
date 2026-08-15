import { Product } from "@/data/products";
import { formatPKR, waLink } from "@/lib/site";
import { ShieldCheck, MessageCircle, Factory, Truck, RefreshCcw, CreditCard, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchasePanelProps {
  product: Product;
  totalPairs: number;
  totalAmount: number;
  selectedColor: string;
}

export function PurchasePanel({ product, totalPairs, totalAmount, selectedColor }: PurchasePanelProps) {
  const moqMet = totalPairs >= product.moq;
  const isMultipleOf12 = totalPairs > 0 && totalPairs % 12 === 0;
  const isValidOrder = moqMet && isMultipleOf12;

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
          <div><strong className="text-foreground">Color:</strong> Single color per carton</div>
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
            Minimum order quantity is {product.moq} pairs (1 carton).
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
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-sm"
          disabled={!isValidOrder}
        >
          Send Inquiry
        </Button>
        <Button 
          variant="outline"
          className="w-full h-12 rounded-xl border-leather text-leather-deep hover:bg-leather/5 text-base"
        >
          Request Sample
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

      <div className="h-px bg-border w-full" />

      {/* Supplier Mini-block */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
            <Factory className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-foreground leading-tight text-sm">Anamon Official Store</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
              <span className="text-xs text-emerald font-medium">Verified Supplier</span>
              <span className="text-xs text-muted-foreground ml-1">· 5 yrs</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><span className="font-medium text-foreground">City:</span> Lahore, PK</div>
          <div><span className="font-medium text-foreground">Response:</span> &lt; 2h</div>
        </div>

        <button className="text-sm font-medium text-primary flex items-center hover:underline w-fit mt-1">
          View store <ChevronRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* Assurances */}
      <div className="flex flex-col gap-3 bg-muted/30 rounded-xl p-4 border border-border/50">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <CreditCard className="w-4 h-4 text-emerald" />
          <span>Secure payments</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Truck className="w-4 h-4 text-emerald" />
          <span>On-time dispatch</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground">
          <RefreshCcw className="w-4 h-4 text-emerald" />
          <span>7-day return policy</span>
        </div>
      </div>

    </div>
  );
}
