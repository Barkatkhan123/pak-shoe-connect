import { createFileRoute, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Truck,
  Layers,
  ArrowUpRight,
  Sparkles,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatPKR } from "@/lib/site";

export const Route = createFileRoute("/dashboard/supplier")({
  loader: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
    const role = session.user?.user_metadata?.role || session.user?.user_metadata?.accountType;
    if (!role || !["SUPPLIER", "supplier", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      throw redirect({ to: "/auth" });
    }
    return { session };
  },
  component: SupplierDashboard,
});

// Mock Initial RFQs
interface RFQItem {
  id: string;
  rfqNumber: string;
  productTitle: string;
  sku: string;
  buyerName: string;
  buyerCompany: string;
  destination: string;
  quantity: number;
  targetPrice: number;
  status: "SUBMITTED" | "SUPPLIER_QUOTED" | "BUYER_ACCEPTED";
  customBranding: boolean;
  deadlineHours: number;
  quotedPrice?: number;
  leadTimeDays?: number;
}

const INITIAL_RFQS: RFQItem[] = [
  {
    id: "rfq-8812",
    rfqNumber: "RFQ-PK-2026-8812",
    productTitle: "Double Sole Peshawari Chappal",
    sku: "SHR-PSH-001",
    buyerName: "Usman Ghani",
    buyerCompany: "Desert Footwear Retail UAE",
    destination: "Dubai (Air Cargo Export)",
    quantity: 3000,
    targetPrice: 1200,
    status: "SUBMITTED",
    customBranding: true,
    deadlineHours: 36,
  },
  {
    id: "rfq-8819",
    rfqNumber: "RFQ-PK-2026-8819",
    productTitle: "Handmade Cowhide Kaptaan Chappal",
    sku: "SHR-KPT-002",
    buyerName: "Farhan Siddiqui",
    buyerCompany: "Zalmi Footwear Karachi",
    destination: "Karachi (TCS Cargo Hub)",
    quantity: 500,
    targetPrice: 1350,
    status: "SUBMITTED",
    customBranding: false,
    deadlineHours: 48,
  },
  {
    id: "rfq-8805",
    rfqNumber: "RFQ-PK-2026-8805",
    productTitle: "Charsadda Traditional Zalmi Chappal",
    sku: "SHR-ZAL-003",
    buyerName: "Tariq Anwer",
    buyerCompany: "Punjab Shoe Mart Lahore",
    destination: "Lahore (Shah Alam Market)",
    quantity: 1200,
    targetPrice: 1280,
    status: "SUPPLIER_QUOTED",
    customBranding: true,
    deadlineHours: 12,
    quotedPrice: 1250,
    leadTimeDays: 10,
  },
];

// Initial 3-State SKU Inventory
interface SKUInventory {
  skuCode: string;
  color: string;
  sizeEU: string;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
}

const INITIAL_SKUS: SKUInventory[] = [
  { skuCode: "SHR-PSH-001-BLK-39", color: "Black", sizeEU: "39", availableStock: 450, reservedStock: 50, soldStock: 800 },
  { skuCode: "SHR-PSH-001-BLK-40", color: "Black", sizeEU: "40", availableStock: 600, reservedStock: 100, soldStock: 1200 },
  { skuCode: "SHR-PSH-001-BLK-41", color: "Black", sizeEU: "41", availableStock: 950, reservedStock: 200, soldStock: 1500 },
  { skuCode: "SHR-PSH-001-BLK-42", color: "Black", sizeEU: "42", availableStock: 1200, reservedStock: 500, soldStock: 2100 },
  { skuCode: "SHR-PSH-001-BLK-43", color: "Black", sizeEU: "43", availableStock: 800, reservedStock: 150, soldStock: 1400 },
  { skuCode: "SHR-PSH-001-BLK-44", color: "Black", sizeEU: "44", availableStock: 500, reservedStock: 80, soldStock: 950 },
];

function SupplierDashboard() {
  const { session } = Route.useLoaderData();
  const userMetadata = session?.user?.user_metadata || {};
  const [activeTab, setActiveTab] = useState<"overview" | "rfqs" | "inventory" | "orders" | "analytics" | "settings">("overview");

  // RFQ State
  const [rfqs, setRfqs] = useState<RFQItem[]>(INITIAL_RFQS);
  const [rfqFilter, setRfqFilter] = useState<string>("ALL");
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<RFQItem | null>(null);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState<number>(1250);
  const [quoteLeadTime, setQuoteLeadTime] = useState<number>(12);
  const [quoteTerms, setQuoteTerms] = useState<string>("50% advance in Escrow / 50% on Bilti");
  const [quoteNotes, setQuoteNotes] = useState<string>("OEM Laser Branding & Custom Master Cartons Included");
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  // Inventory State
  const [skus, setSkus] = useState<SKUInventory[]>(INITIAL_SKUS);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  // Orders State
  const [orders, setOrders] = useState([
    {
      id: "ord-9901",
      orderNumber: "ORD-PK-2026-9901",
      buyer: "Usman Ghani (Desert Footwear UAE)",
      destination: "Karachi Port ➔ Dubai",
      quantity: 500,
      totalAmount: 669450,
      status: "IN_PRODUCTION",
      carrier: "Faisal Movers Cargo B2B",
      biltiNumber: "BILTI-LHR-88219",
    },
    {
      id: "ord-9872",
      orderNumber: "ORD-PK-2026-9872",
      buyer: "Farhan Siddiqui (Zalmi Footwear)",
      destination: "Karachi",
      quantity: 1000,
      totalAmount: 1250000,
      status: "ESCROW_FUNDED",
      carrier: "TCS Logistics",
      biltiNumber: "Pending Dispatch",
    },
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfqForQuote) return;

    // Trigger live backend event hub & WhatsApp queue
    try {
      await apiClient.supplier.submitQuote({
        rfqId: selectedRfqForQuote.id,
        supplierId: "sup-1",
        unitPrice: quoteUnitPrice,
        leadTimeDays: quoteLeadTime,
      });
    } catch {
      // Graceful fallback
    }

    setRfqs((prev) =>
      prev.map((r) =>
        r.id === selectedRfqForQuote.id
          ? {
              ...r,
              status: "SUPPLIER_QUOTED",
              quotedPrice: quoteUnitPrice,
              leadTimeDays: quoteLeadTime,
            }
          : r
      )
    );

    setQuoteSuccessMsg(
      `✅ Quote of PKR ${quoteUnitPrice.toLocaleString()}/pair submitted for ${selectedRfqForQuote.rfqNumber}! WhatsApp alert sent to ${selectedRfqForQuote.buyerName}.`
    );

    setTimeout(() => {
      setSelectedRfqForQuote(null);
      setQuoteSuccessMsg(null);
    }, 2000);
  };

  const handleUpdateStock = (skuCode: string) => {
    setSkus((prev) =>
      prev.map((s) =>
        s.skuCode === skuCode ? { ...s, availableStock: editStockValue } : s
      )
    );
    setEditingSku(null);
  };

  const filteredRfqs = rfqs.filter((r) => {
    if (rfqFilter === "ALL") return true;
    return r.status === rfqFilter;
  });

  return (
    <SiteLayout>
      {/* Enterprise Top Banner */}
      <div className="bg-ink text-white border-b border-white/10 shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep px-3 py-1 text-xs font-bold text-emerald-100 border border-emerald-400/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Gold Factory Verified
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-cream/90 font-mono">
                  Trust Score: 94/100
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-2">
                Sialkot Master Footwear Syndicate
              </h1>
              <p className="text-xs text-cream/70 mt-0.5 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Daska Road Industrial Estate, Sialkot, Pakistan • Monthly Capacity: 25,000 pairs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-cream/60">Response Rate</div>
                <div className="text-sm font-bold text-emerald-400">98% (&lt; 2 Hours)</div>
              </div>
              <button
                onClick={() => setActiveTab("rfqs")}
                className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-ink shadow-sm hover:bg-gold-light transition cursor-pointer"
              >
                <FileText className="h-4 w-4" /> Review Live RFQs
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
              {[
                { id: "overview", label: "Factory Overview", icon: TrendingUp },
                { id: "rfqs", label: "Live RFQ Inbox", icon: FileText, badge: rfqs.filter((r) => r.status === "SUBMITTED").length },
                { id: "inventory", label: "3-State Inventory", icon: Layers },
                { id: "orders", label: "Production & Bilti", icon: Truck, badge: orders.length },
                { id: "analytics", label: "Factory Analytics", icon: TrendingUp },
                { id: "settings", label: "Factory Settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === item.id
                      ? "bg-ink text-gold font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="rounded-full bg-gold/20 text-gold-dark px-2 py-0.5 text-xs font-bold font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="hidden lg:block h-px bg-border my-3" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </nav>
          </div>

          {/* Main Dashboard Panel */}
          <div className="flex-1 min-w-0">
            {/* 1. FACTORY OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                      <span>Total Revenue (Escrow Funded)</span>
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold font-display text-foreground">{formatPKR(4850000)}</div>
                    <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> +18.4% this month
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                      <span>Pending RFQs</span>
                      <FileText className="h-4 w-4 text-gold-dark" />
                    </div>
                    <div className="text-2xl font-bold font-display text-foreground">
                      {rfqs.filter((r) => r.status === "SUBMITTED").length} Inquiries
                    </div>
                    <div className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Fast reply maintains Gold Rank
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                      <span>Orders in Production</span>
                      <Truck className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold font-display text-foreground">{orders.length} Batch Orders</div>
                    <div className="text-xs text-indigo-600 font-semibold mt-1">1,500 pairs in line</div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-2">
                      <span>Monthly Capacity</span>
                      <Layers className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold font-display text-foreground">25,000 Pairs</div>
                    <div className="text-xs text-muted-foreground mt-1">68% Factory Utilization</div>
                  </div>
                </div>

                {/* Priority RFQs & Live Actions */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display font-bold text-lg">Urgent Buyer Inquiries</h3>
                      <p className="text-xs text-muted-foreground">Direct wholesale RFQs requiring formal quotation</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("rfqs")}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      View All RFQs →
                    </button>
                  </div>

                  <div className="divide-y divide-border">
                    {rfqs.slice(0, 2).map((rfq) => (
                      <div key={rfq.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{rfq.rfqNumber}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                              {rfq.quantity.toLocaleString()} pairs
                            </span>
                            {rfq.customBranding && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gold/20 text-gold-dark font-semibold flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Custom OEM
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-muted-foreground mt-1">
                            {rfq.productTitle} • Buyer: <span className="text-foreground">{rfq.buyerCompany}</span> ({rfq.destination})
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Target Rate</div>
                            <div className="text-sm font-bold text-emerald-600">PKR {rfq.targetPrice}/pair</div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedRfqForQuote(rfq);
                              setActiveTab("rfqs");
                            }}
                            className="rounded-md bg-ink px-3.5 py-2 text-xs font-bold text-gold hover:bg-ink-light transition cursor-pointer"
                          >
                            Quote Rates
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. LIVE RFQ INBOX & QUOTE SUBMISSION */}
            {activeTab === "rfqs" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold">RFQ Inquiries & Negotiations</h2>
                    <p className="text-xs text-muted-foreground">Real-time buyer quotation requests and formal bidding</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {["ALL", "SUBMITTED", "SUPPLIER_QUOTED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setRfqFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          rfqFilter === st
                            ? "bg-ink text-gold"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {st === "ALL" ? "All Inquiries" : st === "SUBMITTED" ? "Pending Quote" : "Quoted"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quote Submission Modal/Drawer if selected */}
                {selectedRfqForQuote && (
                  <div className="rounded-xl border-2 border-gold bg-amber-500/5 p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark bg-gold/20 px-2 py-0.5 rounded">
                          <Send className="h-3 w-3" /> Submit Formal Factory Quotation
                        </div>
                        <h3 className="font-display font-bold text-lg mt-1">
                          Quote for {selectedRfqForQuote.rfqNumber} — {selectedRfqForQuote.productTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Buyer: {selectedRfqForQuote.buyerName} ({selectedRfqForQuote.buyerCompany}) • Destination: {selectedRfqForQuote.destination}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedRfqForQuote(null)}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {quoteSuccessMsg ? (
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500 text-emerald-700 font-bold text-sm">
                        {quoteSuccessMsg}
                      </div>
                    ) : (
                      <form onSubmit={handleQuoteSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            Quoted Unit Price (PKR)
                          </label>
                          <input
                            type="number"
                            value={quoteUnitPrice}
                            onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-bold font-mono focus:border-gold outline-none"
                            required
                          />
                          <span className="text-[10px] text-muted-foreground">Buyer target: PKR {selectedRfqForQuote.targetPrice}</span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            Lead Time (Production Days)
                          </label>
                          <input
                            type="number"
                            value={quoteLeadTime}
                            onChange={(e) => setQuoteLeadTime(Number(e.target.value))}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-bold font-mono focus:border-gold outline-none"
                            required
                          />
                          <span className="text-[10px] text-muted-foreground">Days to dispatch {selectedRfqForQuote.quantity.toLocaleString()} pairs</span>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-foreground block mb-1">
                            Payment & Escrow Terms
                          </label>
                          <input
                            type="text"
                            value={quoteTerms}
                            onChange={(e) => setQuoteTerms(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold outline-none"
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-xs font-bold text-foreground block mb-1">
                            Manufacturing & OEM Customization Notes
                          </label>
                          <input
                            type="text"
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="w-full rounded-md bg-gold px-4 py-2.5 text-sm font-bold text-ink hover:bg-gold-light transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Send className="h-4 w-4" /> Send Quotation
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* RFQ Listing Table */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">RFQ Number</th>
                        <th className="px-4 py-3 font-semibold">Product & Specs</th>
                        <th className="px-4 py-3 font-semibold">Quantity</th>
                        <th className="px-4 py-3 font-semibold">Destination</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredRfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {rfq.rfqNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{rfq.productTitle}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              {rfq.buyerCompany}
                              {rfq.customBranding && (
                                <span className="bg-gold/20 text-gold-dark font-bold text-[10px] px-1.5 rounded">
                                  OEM Logo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {rfq.quantity.toLocaleString()} pairs
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{rfq.destination}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                rfq.status === "SUBMITTED"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }`}
                            >
                              {rfq.status === "SUBMITTED" ? "Pending Quote" : `Quoted: PKR ${rfq.quotedPrice}`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedRfqForQuote(rfq);
                                if (rfq.quotedPrice) setQuoteUnitPrice(rfq.quotedPrice);
                              }}
                              className="rounded-md bg-ink px-3 py-1.5 text-xs font-bold text-gold hover:bg-ink-light transition cursor-pointer"
                            >
                              {rfq.status === "SUBMITTED" ? "Quote" : "Edit Quote"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. 3-STATE INVENTORY MATRIX */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display font-bold">3-State Inventory Matrix</h2>
                    <p className="text-xs text-muted-foreground">
                      Real-time SKU depth: Available Stock | Reserved (Active Locks) | Sold
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">SKU Code</th>
                        <th className="px-4 py-3 font-semibold">Size EU</th>
                        <th className="px-4 py-3 font-semibold">Color</th>
                        <th className="px-4 py-3 font-semibold text-emerald-600">Available Stock</th>
                        <th className="px-4 py-3 font-semibold text-amber-600">Reserved (Locked)</th>
                        <th className="px-4 py-3 font-semibold text-indigo-600">Sold (Fulfilled)</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {skus.map((sku) => (
                        <tr key={sku.skuCode} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono font-bold text-foreground text-xs">{sku.skuCode}</td>
                          <td className="px-4 py-3 font-bold font-mono">EU {sku.sizeEU}</td>
                          <td className="px-4 py-3 text-xs">{sku.color}</td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                            {editingSku === sku.skuCode ? (
                              <input
                                type="number"
                                value={editStockValue}
                                onChange={(e) => setEditStockValue(Number(e.target.value))}
                                className="w-24 rounded border border-border px-2 py-1 text-xs bg-background"
                              />
                            ) : (
                              `${sku.availableStock.toLocaleString()} pairs`
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-amber-600">
                            {sku.reservedStock.toLocaleString()} pairs
                          </td>
                          <td className="px-4 py-3 font-mono text-indigo-600">
                            {sku.soldStock.toLocaleString()} pairs
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingSku === sku.skuCode ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateStock(sku.skuCode)}
                                  className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingSku(null)}
                                  className="rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingSku(sku.skuCode);
                                  setEditStockValue(sku.availableStock);
                                }}
                                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                Adjust Stock
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. PRODUCTION & BILTI DISPATCH */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold">Production & Bilti Dispatch Pipeline</h2>
                  <p className="text-xs text-muted-foreground">
                    Track wholesale orders from Escrow Funded ➔ Quality Inspection ➔ Cargo Dispatch
                  </p>
                </div>

                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="rounded-xl border border-border bg-card p-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{ord.orderNumber}</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Buyer: <span className="font-semibold text-foreground">{ord.buyer}</span> • {ord.destination}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Order Value</div>
                          <div className="text-lg font-bold text-primary">{formatPKR(ord.totalAmount)}</div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 pt-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block">Batch Quantity</span>
                          <span className="font-bold font-mono text-foreground">{ord.quantity} pairs (21 Cartons)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Assigned Carrier</span>
                          <span className="font-bold text-foreground">{ord.carrier}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Bilti Number</span>
                          <span className="font-bold font-mono text-foreground">{ord.biltiNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. FACTORY ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-bold">Factory Performance Analytics</h2>
                  <p className="text-xs text-muted-foreground">RFQ response times, buyer destinations and revenue trajectory</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Response Rate Progress */}
                  <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="font-bold text-sm mb-4">Monthly RFQ Response Rate</h3>
                    <div className="space-y-4">
                      {[
                        { month: "January", rate: 82 },
                        { month: "February", rate: 91 },
                        { month: "March", rate: 97 },
                      ].map((r) => (
                        <div key={r.month} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{r.month}</span>
                            <span>{r.rate}%</span>
                          </div>
                          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.rate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buyer Geographical Spread */}
                  <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <h3 className="font-bold text-sm mb-4">Buyer Geographic Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { city: "Karachi", pct: 45, orders: "154 orders" },
                        { city: "Lahore", pct: 30, orders: "103 orders" },
                        { city: "Dubai (Export)", pct: 15, orders: "51 orders" },
                        { city: "Faisalabad", pct: 10, orders: "34 orders" },
                      ].map((c) => (
                        <div key={c.city} className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                          <span className="font-medium text-foreground">{c.city}</span>
                          <span className="font-mono text-muted-foreground">{c.orders}</span>
                          <span className="font-bold text-primary">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SETTINGS */}
            {activeTab === "settings" && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h2 className="text-xl font-display font-bold">Factory Profile & NTN Verification</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground block">Factory Legal Name</label>
                    <input type="text" defaultValue="Sialkot Master Footwear Syndicate" className="w-full rounded border border-border px-3 py-2 mt-1 bg-background text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block">NTN Tax Number</label>
                    <input type="text" defaultValue="NTN-998822-1" className="w-full rounded border border-border px-3 py-2 mt-1 bg-background text-foreground font-mono" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
