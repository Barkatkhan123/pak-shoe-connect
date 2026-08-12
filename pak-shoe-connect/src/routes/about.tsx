import { createFileRoute, Link } from "@tanstack/react-router";
import { Factory, Target, Eye, Award, Boxes, BadgeCheck, ArrowRight } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";
import factoryImg from "@/assets/factory.jpg";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About SherSha — Wholesale Footwear Manufacturer in Pakistan" },
      {
        name: "description",
        content:
          "SherSha is a Karachi-based wholesale footwear manufacturer supplying retailers and distributors across Pakistan since 1998. 8,000 pairs/day capacity.",
      },
      { property: "og:title", content: "About SherSha" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function About() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title="Manufacturing Pakistan's everyday footwear for 25+ years."
        description="From a single stitching unit in Korangi to two full-scale factories today — SherSha has grown into one of Pakistan's most trusted B2B footwear names."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <img src={factoryImg} alt="SherSha factory floor" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Our story</h2>
            <p className="mt-4 text-muted-foreground">
              SherSha was founded in 1998 by a family of Karachi-based shoemakers with a
              simple belief: Pakistani retailers deserve consistent quality at honest factory
              rates. What started as a small peshawari chappal workshop now produces men's,
              women's and kids' footwear at scale for over 1,200 dealers nationwide.
            </p>
            <p className="mt-3 text-muted-foreground">
              Today SherSha runs two production units — in Korangi (Karachi) and Sialkot —
              with 400+ skilled workers, in-house sole moulding, and a dedicated private-label
              team serving new-age D2C brands.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3">
          {[
            { icon: Target, title: "Mission", body: "Deliver factory-direct, dependable footwear to every corner of Pakistan — with fair prices for retailers and lasting comfort for end customers." },
            { icon: Eye, title: "Vision", body: "To be Pakistan's most trusted wholesale footwear partner and a global name in private-label manufacturing." },
            { icon: Award, title: "Values", body: "Craftsmanship, consistency, and long-term relationships. No middlemen. No surprises." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-background p-6">
              <c.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
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
                ["2 factories", "Korangi (Karachi) & Sialkot"],
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
                Buffer stock on best-sellers so dealers can reorder without waiting for
                production cycles. Ready dispatch within 48 hours on stocked SKUs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ink py-20 text-white text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl mb-4">Ready to partner with us?</h2>
          <p className="text-cream/80 text-lg mb-8">Browse our wholesale catalog or get in touch with our sales team today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" search={{ category: undefined, gender: undefined }} className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white hover:bg-white hover:text-primary transition-all hover:scale-105">
              Browse Catalog <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 glass-dark px-8 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
