import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Boxes, Factory, PackageCheck, Scissors, Warehouse, ShieldCheck, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import factoryImg from "@/assets/factory.jpg";

export const Route = createFileRoute("/manufacturing")({
  component: Manufacturing,
  head: () => ({
    meta: [
      { title: "Manufacturing & Factory — Anamon Footwear Pakistan" },
      {
        name: "description",
        content:
          "Inside Anamon's shoe manufacturing facilities in Rawalpindi and Lahore, Pakistan. In-house cutting, stitching, sole moulding, 3-stage QC and warehousing.",
      },
      { property: "og:title", content: "Manufacturing & Facilities — Anamon" },
      { property: "og:url", content: "/manufacturing" },
    ],
    links: [{ rel: "canonical", href: "/manufacturing" }],
  }),
});

function Manufacturing() {
  return (
    <SiteLayout>
      {/* Cinematic Hero */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <img 
          src={factoryImg} 
          alt="Anamon factory floor" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 hero-overlay-premium" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-sm font-medium mb-6">
            <Factory className="w-4 h-4" />
            <span>Factory Direct Manufacturing</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 text-balance">
            Every pair, built under one roof.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed text-balance">
            Dual manufacturing facilities in Rawalpindi & Lahore — engineered for nationwide B2B scale, custom OEM production, and direct factory pricing.
          </p>
        </div>
      </section>

      {/* Overlapping Stats Grid */}
      <section className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 -mt-16 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: "8,000", label: "Pairs / Day Capacity" },
            { value: "400+", label: "Skilled Artisans & Workers" },
            { value: "2", label: "Plants (Rawalpindi & Lahore)" },
            { value: "15-25", label: "Days Lead Time" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 md:p-8 text-center premium-shadow border border-white/40">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Plant Locations Breakdown */}
      <section className="py-16 border-b border-border bg-card/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <Factory className="h-3.5 w-3.5" />
              <span>Production Hubs</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Manufacturing Facilities
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Strategically located manufacturing hubs in Rawalpindi and Lahore to serve retailers and wholesale buyers across Pakistan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Rawalpindi Plant */}
            <div className="rounded-2xl border border-border bg-card p-8 premium-shadow transition-all duration-300 hover:border-primary/30">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary mb-2">
                    Plant 01 · Northern Hub
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Rawalpindi Manufacturing Facility
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Industrial Estate, Rawalpindi, Pakistan
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Factory className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Specialized in traditional craftsmanship, handcrafted Peshawari chappals, full-grain leather Oxfords, precision laser cutting, and master artisan upper stitching lines.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block">Key Focus</span>
                  <strong className="text-foreground font-semibold">Leather & Peshawari Craft</strong>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block">Daily Output</span>
                  <strong className="text-foreground font-semibold">3,500+ Pairs / Day</strong>
                </div>
              </div>
            </div>

            {/* Lahore Plant */}
            <div className="rounded-2xl border border-border bg-card p-8 premium-shadow transition-all duration-300 hover:border-primary/30">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-[#C9A84C]/15 text-[#C9A84C] mb-2">
                    Plant 02 · Central Hub
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Lahore Manufacturing Facility
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Industrial Hub / Gulberg Area, Lahore, Pakistan
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                  <Factory className="h-6 w-6 text-[#C9A84C]" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                High-capacity industrial sole moulding (PU, TPR, and vulcanized rubber), automated sneaker assembly lines, 3-stage QC testing labs, and central warehouse logistics.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block">Key Focus</span>
                  <strong className="text-foreground font-semibold">Sole Moulding & Assembly</strong>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground block">Daily Output</span>
                  <strong className="text-foreground font-semibold">4,500+ Pairs / Day</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Grid */}
      <section className="relative bg-noise py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">The Production Line</h2>
            <p className="text-muted-foreground text-lg">We control every step of the supply chain in-house, ensuring zero delays and uncompromising quality for your bulk orders.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Scissors, title: "Cutting & Pattern", body: "Automated cutters and skilled leather masters. Zero-waste patterning for consistent grading." },
              { icon: Factory, title: "Stitching Lines", body: "Dedicated men's, women's and kids' stitching floors. Quality-tuned machines per shoe type." },
              { icon: Boxes, title: "Sole Moulding", body: "In-house PU, TPR and rubber sole plants. No outsourcing means faster lead times." },
              { icon: BadgeCheck, title: "3-Stage QC", body: "Material check, in-line audit, and pre-pack inspection. Every carton signed off by masters." },
              { icon: PackageCheck, title: "OEM Packing", body: "Branded boxes, insoles, hangtags for private-label orders. Master cartons ready for freight." },
              { icon: Warehouse, title: "Warehousing", body: "Buffer stock on best-sellers for 48-hour dispatch. Nationwide freight partners for fast delivery." },
            ].map((s) => (
              <div 
                key={s.title} 
                className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1.5 hover:premium-shadow-lg hover:border-primary/20"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Certifications */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald mx-auto mb-6" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Certified Quality Standards</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Our facilities meet the highest international compliance and quality standards, making us a trusted partner for global exports.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["ISO 9001:2015", "BSCI Certified", "Sedex Member", "100% Export Quality", "Trade Assurance"].map((cert) => (
              <div key={cert} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald font-medium text-sm animate-badge-pop">
                <Check className="w-4 h-4" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
