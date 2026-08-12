import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { formatPKR } from "@/lib/site";
import { PaymentGateway } from "@/components/payment-gateway";
import { useState } from "react";
import { Package, ShieldCheck, Truck, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({
    meta: [{ title: "Secure Checkout — SherSha Wholesale" }],
  }),
});

function Checkout() {
  const { items, totalItems, clearBasket } = useInquiryBasket();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
  const [orderId, setOrderId] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.requestedQty), 0);
  const tax = subtotal * 0.18; // 18% GST typical for Pakistan
  const shipping = totalItems > 500 ? 0 : 5000; // Free shipping over 500 pairs
  const total = subtotal + tax + shipping;

  // Advance Payment (30% for wholesale manufacturing)
  const advancePayment = total * 0.30;

  if (items.length === 0 && step !== "success") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Your basket is empty</h1>
          <p className="mt-4 text-muted-foreground">You need to add products to your inquiry basket before checking out.</p>
          <Link to="/products" search={{ category: undefined, gender: undefined }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-ink">
            Browse Catalog
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (txId: string) => {
    setOrderId(txId);
    setStep("success");
    clearBasket();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SiteLayout>
      <div className="bg-muted/30 min-h-screen py-12 border-t border-border">
        <div className="mx-auto max-w-6xl px-4">
          
          <AnimatePresence mode="wait">
            {step === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-2xl text-center py-20"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <h1 className="font-display text-4xl font-bold text-ink mb-4">Order Placed Successfully!</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your wholesale manufacturing order <strong className="text-ink">{orderId}</strong> is confirmed. We have received your 30% advance payment.
                </p>
                <div className="rounded-2xl border border-border bg-white p-6 premium-shadow mb-8 text-left">
                  <h3 className="font-bold text-ink mb-4 border-b border-border pb-2">Next Steps</h3>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-3"><span className="font-bold text-primary">1.</span> Our production manager will contact you within 24 hours to confirm sizing runs.</li>
                    <li className="flex gap-3"><span className="font-bold text-primary">2.</span> Production will begin immediately. Expected lead time is 14-21 days.</li>
                    <li className="flex gap-3"><span className="font-bold text-primary">3.</span> You will be invoiced for the remaining 70% balance prior to dispatch.</li>
                  </ul>
                </div>
                <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-bold text-white transition-all hover:bg-primary">
                  Return to Home
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-8 lg:grid-cols-12"
              >
                
                {/* ── Left Column: Forms ── */}
                <div className="lg:col-span-7 xl:col-span-8">
                  {/* Stepper */}
                  <div className="mb-8 flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <button 
                      onClick={() => setStep("shipping")}
                      className={`flex items-center gap-2 ${step === "shipping" ? "text-primary" : "hover:text-ink"}`}
                    >
                      <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${step === "shipping" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>1</span>
                      Shipping Details
                    </button>
                    <ArrowRight className="h-4 w-4 opacity-30" />
                    <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : ""}`}>
                      <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${step === "payment" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>2</span>
                      Payment
                    </div>
                  </div>

                  {step === "shipping" ? (
                    <div className="rounded-2xl border border-border bg-white p-6 md:p-8 premium-shadow">
                      <h2 className="font-display text-2xl font-bold text-ink mb-6 flex items-center gap-2">
                        <Truck className="h-6 w-6 text-primary" /> Delivery Information
                      </h2>
                      <form onSubmit={handleShippingSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs font-bold text-ink">Company / Retailer Name</label>
                            <input required type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. Metro Shoes" />
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-bold text-ink">NTN / GST Number (Optional)</label>
                            <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" placeholder="For tax exemption" />
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-bold text-ink">Contact Person</label>
                            <input required type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Full Name" />
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-bold text-ink">WhatsApp Number</label>
                            <input required type="tel" className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" placeholder="+92 300 0000000" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold text-ink">Delivery Address (Godown / Shop)</label>
                          <textarea required rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Complete address for truck delivery" />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs font-bold text-ink">City</label>
                            <select required className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                              <option value="">Select City...</option>
                              <option value="karachi">Karachi</option>
                              <option value="lahore">Lahore</option>
                              <option value="islamabad">Islamabad</option>
                              <option value="faisalabad">Faisalabad</option>
                              <option value="multan">Multan</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-xs font-bold text-ink">Preferred Transporter</label>
                            <select className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                              <option value="tcs">TCS Logistics</option>
                              <option value="leopards">Leopards Courier</option>
                              <option value="mmp">MMP Cargo</option>
                              <option value="other">Own Transport (Biltee)</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <button type="submit" className="w-full rounded-xl bg-ink px-4 py-4 text-sm font-bold text-white transition-all hover:bg-primary shadow-lg flex justify-center items-center gap-2">
                            Continue to Payment <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <PaymentGateway amount={advancePayment} onSuccess={handlePaymentSuccess} />
                  )}
                </div>

                {/* ── Right Column: Order Summary ── */}
                <div className="lg:col-span-5 xl:col-span-4">
                  <div className="sticky top-24 rounded-2xl border border-border bg-white p-6 premium-shadow">
                    <h3 className="font-display text-xl font-bold text-ink mb-6">Order Summary</h3>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6">
                      {items.map(item => (
                        <div key={item.slug} className="flex gap-3 text-sm">
                          <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-cream border border-border" />
                          <div className="flex-1">
                            <p className="font-bold line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.requestedQty} pairs @ {formatPKR(item.price)}</p>
                          </div>
                          <div className="font-bold text-right">
                            {formatPKR(item.price * item.requestedQty)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 text-sm border-t border-border pt-4">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal ({totalItems} pairs)</span>
                        <span>{formatPKR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>GST (18%)</span>
                        <span>{formatPKR(tax)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Logistics Estimate</span>
                        <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">Free</span> : formatPKR(shipping)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border mt-4 pt-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-ink text-base">Total Order Value</span>
                        <span className="font-display text-xl font-bold text-ink">{formatPKR(total)}</span>
                      </div>
                      
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-primary flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Advance Payable Now (30%)</span>
                          <span className="font-display text-2xl font-black text-primary">{formatPKR(advancePayment)}</span>
                        </div>
                        <p className="text-[10px] text-primary/70 leading-relaxed">
                          Remaining 70% balance ({formatPKR(total - advancePayment)}) will be invoiced upon production completion, prior to dispatch.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </SiteLayout>
  );
}
