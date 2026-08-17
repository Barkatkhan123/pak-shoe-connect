import React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Truck,
  ShieldCheck,
  FileText,
  MapPin,
  Package,
} from "lucide-react";
import { formatPKR } from "@/lib/site";

export interface TimelineItem {
  step: string;
  title: string;
  description: string;
  timestamp: string | null;
  completed: boolean;
}

export interface TrackingData {
  orderNumber: string;
  status: string;
  carrierName: string;
  biltiNumber: string;
  originCity: string;
  destinationCity: string;
  totalPairs: number;
  totalCartons: number;
  totalAmount: number;
  timeline: TimelineItem[];
}

interface BiltiTrackerProps {
  data: TrackingData;
}

export function BiltiTracker({ data }: BiltiTrackerProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-muted-foreground">
              {data.orderNumber}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
              <Truck className="h-3.5 w-3.5" /> {data.status}
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mt-1">
            Goods Consignment Tracking
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{data.originCity}</span> ➔{" "}
            <strong className="text-foreground">{data.destinationCity}</strong>
          </div>
        </div>

        <div className="rounded-xl bg-muted/60 p-4 font-mono text-xs space-y-1 text-right">
          <div className="text-muted-foreground">Logistics Forwarder</div>
          <div className="font-bold text-sm text-foreground">{data.carrierName}</div>
          <div className="text-emerald-600 font-bold">Bilti Consignment: {data.biltiNumber}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Consignment Volume</div>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">
            {data.totalPairs} Pairs
          </div>
          <div className="text-[10px] text-muted-foreground">
            {data.totalCartons} Master Cartons
          </div>
        </div>

        <div className="rounded-xl bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Protected Escrow</div>
          <div className="text-lg font-bold font-mono text-primary mt-0.5">
            {formatPKR(data.totalAmount)}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">100% Held in Trust</div>
        </div>

        <div className="rounded-xl bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">Quality Protocol</div>
          <div className="text-lg font-bold text-foreground mt-0.5">AQL 2.5 Passed</div>
          <div className="text-[10px] text-emerald-600 font-medium">Factory Inspected</div>
        </div>
      </div>

      {/* Visual Step Timeline */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-base">Consignment Progression</h3>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:bottom-2 before:left-[11px] sm:before:left-[15px] before:top-2 before:w-[2px] before:bg-border">
          {data.timeline.map((item, idx) => (
            <div key={item.step} className="relative flex items-start gap-4">
              <div
                className={`absolute -left-6 sm:-left-8 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 ${
                  item.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span
                    className={`text-sm font-bold ${item.completed ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {item.title}
                  </span>
                  {item.timestamp && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escrow Release Card */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-foreground">
              Buyer Protection & Escrow Guarantee
            </div>
            <p className="text-xs text-muted-foreground">
              Funds are only released to the manufacturer after you receive the Bilti cargo and
              confirm carton quality.
            </p>
          </div>
        </div>
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shrink-0">
          Confirm Delivery & Release
        </button>
      </div>
    </div>
  );
}
