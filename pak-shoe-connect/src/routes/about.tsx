import { createFileRoute, Link } from "@tanstack/react-router";
import { Factory, Target, Eye, Award, Boxes, BadgeCheck, ArrowRight } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";
import factoryImg from "@/assets/factory.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Anamon Official | Global B2B Wholesale Footwear Manufacturer" },
      {
        name: "description",
        content:
          "Anamon Official is a trusted manufacturer of leather and rexine footwear serving wholesale buyers, retailers, and emerging footwear brands across international markets.",
      },
      {
        name: "keywords",
        content:
          "B2B leather shoe manufacturer, wholesale leather footwear supplier, rexine shoes bulk order, custom private label footwear, leather shoe exporter, OEM shoe manufacturing",
      },
      { property: "og:title", content: "About Anamon Official" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Anamon Official"
        title="International-Grade Materials. Custom Branding. Wholesale Scale."
        description="Anamon Official is a trusted manufacturer of leather and rexine footwear serving wholesale buyers, retailers, and emerging footwear brands across international markets."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-xs">
            <img
              src={factoryImg}
              alt="Anamon Official factory production floor"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-leather mb-2">
              Our Legacy & Global Reach
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-ink">
              Precision Footwear Manufacturing for Modern Wholesale Buyers
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              Anamon Official is a trusted manufacturer of leather and rexine footwear serving wholesale buyers, retailers, and emerging footwear brands across international markets. Backed by skilled craftsmanship, quality-controlled production, and material sourcing that meets global standards, we help businesses scale with competitive pricing, custom manufacturing options, and dependable delivery — from first sample to full container order.
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              What started as a dedicated craftsmanship workshop in 1998 now supplies international-grade footwear at scale with dual state-of-the-art facilities, in-house PU sole moulding, and dedicated private-label engineering.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3">
          {[
            {
              icon: Award,
              title: "Genuine & Premium Materials",
              body: "Every pair is crafted using internationally certified leather and high-grade rexine, engineered for durability, comfort, and a refined finish that meets global quality standards.",
            },
            {
              icon: Target,
              title: "Custom Manufacturing (Private Label & OEM)",
              body: "From private-label branding to custom colorways, logos, and design specifications, our production line adapts to your brand's exact requirements — at scale.",
            },
            {
              icon: Eye,
              title: "Dependable Global Logistics",
              body: "Secure, export-ready packaging and time-tested international shipping partnerships ensure your bulk orders arrive on schedule, anywhere in the world.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-background p-6 shadow-xs">
              <c.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Factory & capacity</h2>
            <ul className="mt-6 space-y-4 text-sm">
              {[
                ["2 factories", "Rawalpindi & Lahore, Pakistan"],
                ["400+ workers", "Cutting, stitching, lasting, QC"],
                ["8,000 pairs / day", "Combined production capacity"],
                ["200+ active SKUs", "Men, women & kids ranges"],
                ["15–25 day lead", "For private-label programs"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-start gap-4 border-b border-border pb-3">
                  <Factory className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold">{k}</div>
                    <div className="text-muted-foreground">{v}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Quality standards</h2>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Genuine leather sourced from certified Pakistani tanneries",
                "In-house last-making for consistent fit across sizes",
                "Automated cutters for zero-waste pattern efficiency",
                "PU / TPR / rubber sole plants under one roof",
                "3-stage QC: material, in-line, and pre-pack inspection",
                "Every carton audited against buyer PO specs",
              ].map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl border border-border bg-cream p-6">
              <Boxes className="h-6 w-6 text-leather" />
              <h3 className="mt-3 font-display text-lg font-semibold">Warehousing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Buffer stock on best-sellers so dealers can reorder without waiting for production
                cycles. Ready dispatch within 48 hours on stocked SKUs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ink py-20 text-white text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl mb-4">
            Ready to partner with us?
          </h2>
          <p className="text-cream/80 text-lg mb-8">
            Browse our wholesale catalog or get in touch with our sales team today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              search={{ category: undefined, gender: undefined }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white hover:bg-white hover:text-primary transition-all hover:scale-105"
            >
              Browse Catalog <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 glass-dark px-8 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
