import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layers,
  Truck,
  Factory,
  Star,
  CheckCircle2,
  Package,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";
import { SupplierProfile } from "./SupplierProfile";
import { ReviewSection } from "./ReviewSection";

interface ProductTabsProps {
  product: EnterpriseProduct;
}

type TabType = "description" | "specifications" | "shipping" | "supplier" | "reviews";

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [selectedCity, setSelectedCity] = useState("Lahore");

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "description", label: "Overview", icon: FileText },
    { id: "specifications", label: "Specifications", icon: Layers },
    { id: "shipping", label: "Shipping & Lead Time", icon: Truck },
    { id: "supplier", label: "Factory Profile", icon: Factory },
    { id: "reviews", label: `Reviews (${product.stats.totalReviews})`, icon: Star },
  ];

  const specsList = Object.entries(product.specifications).filter(([_, val]) => !!val);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Tab Navigation Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/80 pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content Area ── */}
      <div className="py-1">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-4 text-xs text-foreground/90 leading-relaxed"
            >
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Selling points bullet checklist */}
              <div className="flex flex-col gap-2 rounded-2xl bg-secondary/30 p-4 border border-border/60">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Key Wholesale Commercial Advantages
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {product.sellingPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "specifications" && (
            <motion.div
              key="specifications"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-white/70 dark:bg-neutral-900/70"
            >
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {specsList.map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={`border-b border-border/40 last:border-b-0 ${
                        idx % 2 === 0 ? "bg-secondary/20" : "bg-transparent"
                      }`}
                    >
                      <td className="w-1/3 px-4 py-2.5 font-bold text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === "shipping" && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-4 text-xs"
            >
              {/* Shipping Logistics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5">
                  <span className="block font-bold text-foreground">Estimated Dispatch Time</span>
                  <p className="mt-1 text-muted-foreground">{product.shipping.dispatchDays}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-secondary/30 p-3.5">
                  <span className="block font-bold text-foreground">Packaging Standard</span>
                  <p className="mt-1 text-muted-foreground">{product.shipping.cartonInfo}</p>
                </div>
              </div>

              {/* Dynamic Freight Estimator */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4">
                <div className="flex items-center gap-2 font-bold text-foreground mb-2">
                  <Calculator className="h-4 w-4 text-amber-500" />
                  <span>Freight Cargo Cost Estimator</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-muted-foreground">Select Destination City:</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="rounded-xl border border-border bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                  >
                    {["Lahore", "Karachi", "Rawalpindi / Islamabad", "Peshawar", "Faisalabad", "Multan", "Quetta", "Dubai / GCC Port"].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-white dark:bg-neutral-900 p-3 border border-border/50 text-xs">
                  <span className="text-muted-foreground">Estimated B2B Goods Freight (per master carton):</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedCity === "Dubai / GCC Port" ? "$35 USD / ctn (Air/Sea)" : "PKR 450 – 850 / ctn"}
                  </span>
                </div>
              </div>

              {/* Guarantee banner */}
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-3 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>{product.shipping.returnPolicy}</span>
              </div>
            </motion.div>
          )}

          {activeTab === "supplier" && (
            <motion.div
              key="supplier"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <SupplierProfile supplier={product.supplier} />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <ReviewSection product={product} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
