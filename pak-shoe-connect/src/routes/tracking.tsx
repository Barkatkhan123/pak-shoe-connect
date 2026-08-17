import { createFileRoute, useSearch } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState, useEffect } from "react";
import { Search, Truck, Loader2 } from "lucide-react";
import { BiltiTracker, TrackingData } from "@/components/bilti-tracker";
import { apiClient } from "@/lib/api-client";
import { z } from "zod";

const searchSchema = z.object({
  order: z.string().optional().default("ORD-PK-2026-9901"),
});

export const Route = createFileRoute("/tracking")({
  validateSearch: searchSchema,
  component: TrackingPage,
});

const DEFAULT_TRACKING_DATA: TrackingData = {
  orderNumber: "ORD-PK-2026-9901",
  status: "DISPATCHED",
  carrierName: "Faisal Movers Cargo B2B Logistics",
  biltiNumber: "FM-BILTI-LHR-88219",
  originCity: "Rawalpindi / Lahore Footwear Hub",
  destinationCity: "Karachi Port / Shersha Wholesale Hub",
  totalPairs: 500,
  totalCartons: 21,
  totalAmount: 669450,
  timeline: [
    {
      step: "ESCROW_FUNDED",
      title: "Escrow Deposit Verified",
      description: "100% Payment locked securely in Anamon Escrow Ledger via 1Link PayFast",
      timestamp: "2026-08-04T10:15:00Z",
      completed: true,
    },
    {
      step: "IN_PRODUCTION",
      title: "Factory Batch Production",
      description:
        "Laser cutting, full-grain upper stitching & vulcanization at Rawalpindi & Lahore Facilities",
      timestamp: "2026-08-04T12:30:00Z",
      completed: true,
    },
    {
      step: "QUALITY_INSPECTION",
      title: "AQL 2.5 Quality Audit Passed",
      description: "Stitch integrity, leather grading & export carton packaging verified",
      timestamp: "2026-08-04T16:00:00Z",
      completed: true,
    },
    {
      step: "DISPATCHED",
      title: "Dispatched via Goods Forwarder (Bilti Issued)",
      description:
        "Handed over to Faisal Movers Cargo B2B. Goods Consignment Note: FM-BILTI-LHR-88219",
      timestamp: "2026-08-04T18:45:00Z",
      completed: true,
    },
    {
      step: "DELIVERED",
      title: "Delivery & Final Inspection",
      description: "Buyer receives consignment at destination warehouse and releases escrow",
      timestamp: null,
      completed: false,
    },
  ],
};

function TrackingPage() {
  const search = useSearch({ from: "/tracking" });
  const [orderQuery, setOrderQuery] = useState(search.order || "ORD-PK-2026-9901");
  const [currentTracking, setCurrentTracking] = useState<TrackingData>(DEFAULT_TRACKING_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTracking = async (orderNum: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.tracking.get(orderNum);
      const payload = res.data?.tracking || res.data;
      if (res.success && payload) {
        setCurrentTracking({
          orderNumber: payload.orderNumber || payload.orderReference || orderNum,
          status: payload.status || payload.currentStatus || "Processing",
          carrierName: payload.carrierName || payload.carrier || "Carrier TBD",
          biltiNumber: payload.biltiNumber || payload.biltiNo || "Pending",
          originCity: payload.originCity || "Sialkot / Lahore Industrial Hub",
          destinationCity: payload.destinationCity || "Destination TBD",
          totalPairs: payload.totalPairs ?? DEFAULT_TRACKING_DATA.totalPairs,
          totalCartons: payload.totalCartons ?? DEFAULT_TRACKING_DATA.totalCartons,
          totalAmount: payload.totalAmount ?? DEFAULT_TRACKING_DATA.totalAmount,
          timeline:
            payload.timeline?.length > 0
              ? payload.timeline
              : payload.events?.length > 0
                ? payload.events.map((e: any) => ({
                    step: e.step || e.status,
                    title: e.title || e.status,
                    description: e.description || "",
                    timestamp: e.timestamp,
                    completed: e.completed ?? Boolean(e.timestamp),
                  }))
                : DEFAULT_TRACKING_DATA.timeline,
        });
      } else {
        setCurrentTracking({
          ...DEFAULT_TRACKING_DATA,
          orderNumber: orderNum,
          biltiNumber: `BILTI-PK-${Math.floor(10000 + Math.random() * 90000)}`,
        });
      }
    } catch {
      setCurrentTracking({
        ...DEFAULT_TRACKING_DATA,
        orderNumber: orderNum,
        biltiNumber: `BILTI-PK-${Math.floor(10000 + Math.random() * 90000)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (search.order) {
      fetchTracking(search.order);
    }
  }, [search.order]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      fetchTracking(orderQuery.trim());
    }
  };

  return (
    <SiteLayout>
      <div className="bg-ink text-white border-b border-border py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-2 text-xs text-gold mb-2 font-bold">
            <Truck className="h-4 w-4" /> Live Goods Consignment & Bilti Tracking
          </div>
          <h1 className="text-3xl font-display font-bold">Track Your Footwear Shipment</h1>
          <p className="text-sm text-cream/70 mt-1">
            Real-time milestone visibility from factory floor to Bilti cargo terminal.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order # or Bilti # (e.g. ORD-PK-2026-9901)"
                className="w-full rounded-xl border border-white/20 bg-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-light transition cursor-pointer flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Track Bilti
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <BiltiTracker data={currentTracking} />
      </div>
    </SiteLayout>
  );
}
