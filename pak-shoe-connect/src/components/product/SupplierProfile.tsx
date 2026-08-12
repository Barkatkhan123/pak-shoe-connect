import {
  Factory,
  BadgeCheck,
  MapPin,
  Clock,
  Zap,
  ShieldCheck,
  Award,
  Globe2,
  PhoneCall,
} from "lucide-react";
import type { SupplierInfo } from "@/types/product";

interface SupplierProfileProps {
  supplier: SupplierInfo;
  onOpenTourVideo?: () => void;
}

export function SupplierProfile({ supplier, onOpenTourVideo }: SupplierProfileProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-secondary/30 p-5">
      {/* ── Supplier Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Factory className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-foreground">{supplier.name}</h3>
              {supplier.verified && (
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <BadgeCheck className="h-3 w-3" /> Verified Factory
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {supplier.location}
              </span>
              <span>•</span>
              <span>Est. {supplier.establishedYear || 2012}</span>
            </div>
          </div>
        </div>

        {/* Rating Score */}
        <div className="rounded-xl bg-white dark:bg-neutral-900 px-3 py-1.5 shadow-sm border border-border/60 text-right">
          <span className="block text-xs font-semibold text-muted-foreground">Supplier Rating</span>
          <span className="text-sm font-black text-amber-500">★ {supplier.rating} / 5.0</span>
        </div>
      </div>

      {/* ── Supplier Credentials Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-2.5 border border-border/50">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Zap className="h-3 w-3 text-emerald-500" /> Response Rate
          </div>
          <span className="mt-1 block text-sm font-black text-foreground">
            {supplier.responseRate}%
          </span>
        </div>

        <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-2.5 border border-border/50">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Clock className="h-3 w-3 text-blue-500" /> Avg. Reply Time
          </div>
          <span className="mt-1 block text-sm font-black text-foreground">
            {supplier.replyTime}
          </span>
        </div>

        <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-2.5 border border-border/50">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Factory className="h-3 w-3 text-amber-500" /> Monthly Capacity
          </div>
          <span className="mt-1 block text-xs font-black text-foreground truncate">
            {supplier.productionCapacity}
          </span>
        </div>

        <div className="rounded-xl bg-white/80 dark:bg-neutral-900/80 p-2.5 border border-border/50">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Award className="h-3 w-3 text-purple-500" /> Standards
          </div>
          <span className="mt-1 block text-xs font-bold text-foreground truncate">
            ISO 9001:2015 QC
          </span>
        </div>
      </div>

      {/* Export Markets & Trade Assurance */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-blue-500" />
          <span>Major Delivery Hubs: Lahore, Karachi, Rawalpindi, Peshawar, UAE</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="h-4 w-4" /> SherSha Verified Escrow Protected
        </div>
      </div>
    </div>
  );
}
