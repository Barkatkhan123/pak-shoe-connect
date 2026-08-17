import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useAuth } from "@/hooks/use-auth";
import { formatPKR, waLink } from "@/lib/site";
import { Link } from "@tanstack/react-router";
import { Trash2, MessageCircle, Package, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function InquiryDrawer({ isOpen, onClose }: Props) {
  const { items, removeItem, updateQty, totalItems, count } = useInquiryBasket();
  const { isAuthenticated } = useAuth();

  const handleWhatsApp = () => {
    if (items.length === 0) return;

    let msg = `Hi Anamon, I would like to request a wholesale quote for the following items:\n\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}* (SKU: ${item.sku})\n`;
      msg += `   Color: ${item.color}, Size: ${item.size}\n`;
      msg += `   Quantity: ${item.requestedQty} pairs\n\n`;
    });

    window.open(waLink(msg), "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md bg-background border-l border-border">
        <SheetHeader className="border-b border-border p-6 text-left">
          <SheetTitle className="font-display text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Inquiry Basket</span>
              {count > 0 && (
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated && items.length > 0 && (
            <div className="mb-5 rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/15 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B4332] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#1B4332]" />
                  Guest Inquiry Basket
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent("shersha:open-auth-modal"));
                  }}
                  className="font-bold text-[#1B4332] hover:underline cursor-pointer text-[11px]"
                >
                  Sign In to Sync
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                Items are stored locally on your device. Sign in anytime to link your inquiry basket
                to your verified account.
              </p>
            </div>
          )}
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-muted p-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Your basket is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse our catalog and add products to request a wholesale quote.
                </p>
              </div>
              <Link
                to="/products"
                search={{ category: undefined, gender: undefined }}
                onClick={onClose}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-emerald-deep"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-cream">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.sku}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">Color: {item.color}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5">Size: {item.size}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          onClick={() =>
                            updateQty(
                              item.slug,
                              Math.max(item.moq || 10, item.requestedQty - (item.moq || 10)),
                            )
                          }
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          disabled={item.requestedQty <= (item.moq || 10)}
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-medium w-10 text-center">
                          {item.requestedQty}
                        </span>
                        <button
                          onClick={() => updateQty(item.slug, item.requestedQty + (item.moq || 10))}
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Est. Tier</p>
                        <p className="text-xs font-bold text-primary">{item.priceLabel}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-muted/30 p-6">
            <div className="flex justify-between text-sm font-medium mb-4">
              <span>Total Requested Quantity</span>
              <span>{totalItems} pairs</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#128C7E]"
              >
                <MessageCircle className="h-5 w-5" />
                Send Inquiry via WhatsApp
              </button>

              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                Proceed to Secure Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-[10px] text-center text-muted-foreground mt-4">
              By submitting an inquiry, you are requesting pricing based on your volume. No payment
              is required now.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
