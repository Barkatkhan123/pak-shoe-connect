import { useState } from "react";
import { Star, CheckCircle2, ThumbsUp, MapPin } from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";

interface ReviewSectionProps {
  product: EnterpriseProduct;
}

export function ReviewSection({ product }: ReviewSectionProps) {
  const { reviews, stats } = product;
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});

  const handleHelpful = (id: string, initialCount: number) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initialCount) + 1,
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Top Summary & Breakdown ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-border/80 bg-secondary/30 p-4 items-center">
        {/* Big Rating */}
        <div className="flex flex-col items-center justify-center text-center sm:border-r border-border/60 sm:pr-4">
          <span className="text-3xl md:text-4xl font-black text-foreground">
            {stats.rating}
          </span>
          <div className="flex items-center gap-1 my-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(stats.rating) ? "fill-amber-400 text-amber-400" : "text-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Based on {stats.totalReviews} verified buyer ratings
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className="col-span-2 flex flex-col gap-1.5 pl-0 sm:pl-2">
          {[
            { stars: 5, pct: stats.fiveStarPct || 85 },
            { stars: 4, pct: stats.fourStarPct || 10 },
            { stars: 3, pct: stats.threeStarPct || 5 },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2 text-xs">
              <span className="w-12 text-muted-foreground font-medium flex items-center gap-0.5">
                {bar.stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-muted-foreground text-[11px]">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Review Cards List ── */}
      <div className="flex flex-col gap-3">
        {reviews.map((r) => {
          const currentHelpful = helpfulMap[r.id] ?? r.helpful;
          return (
            <div
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-white/70 dark:bg-neutral-900/70 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{r.reviewer}</span>
                    {r.verified && (
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified Wholesale Buyer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" /> {r.city}, {r.country}
                    </span>
                    <span>•</span>
                    <span>{r.date}</span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? "fill-amber-400 text-amber-400" : "text-border"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed mt-1">
                "{r.comment}"
              </p>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleHelpful(r.id, r.helpful)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span>Helpful ({currentHelpful})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
