import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Boxes, Factory, PackageCheck, Scissors, Warehouse, ShieldCheck, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import factoryImg from "@/assets/factory.jpg";

export const Route = createFileRoute("/manufacturing")({
  component: Manufacturing,
  head: () => ({
    meta: [
      { title: "Manufacturing & Factory — SherSha Footwear Pakistan" },
      {
        name: "description",
        content:
          "Inside SherSha's shoe factories in Lahore. In-house cutting, stitching, sole moulding, 3-stage QC and warehousing.",
      },
      { property: "og:title", content: "Manufacturing — SherSha" },
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
          alt="SherSha factory floor" 
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
            From raw leather cutting to final carton packing — experience the full SherSha production process, engineered for B2B scale.
          </p>
        </div>
      </section>

      {/* Overlapping Stats Grid */}
      <section className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 -mt-16 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { value: "8,000", label: "Pairs / Day" },
            { value: "400+", label: "Skilled Workers" },
            { value: "2", label: "Facilities in Lahore" },
            { value: "15-25", label: "Days Lead Time" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 md:p-8 text-center premium-shadow border border-white/40">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-2 text-sm font-medium text-foreground">{stat.label}</div>
            </div>
          ))}
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
