import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, MessageCircle } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";
import { CATEGORIES } from "@/data/products";
import { SITE, waLink } from "@/lib/site";

export const Route = createFileRoute("/catalog")({
  component: Catalog,
  head: () => ({
    meta: [
      { title: "Wholesale Catalog PDF — Anamon Footwear" },
      {
        name: "description",
        content:
          "Browse Anamon's complete wholesale footwear catalog online or download the PDF linesheet for retailers and distributors.",
      },
      { property: "og:title", content: "Wholesale Catalog — Anamon" },
      { property: "og:url", content: "/catalog" },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
  }),
});

function Catalog() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Catalog"
        title="Browse online or download the linesheet."
        description="Complete Anamon wholesale catalog with 200+ SKUs across men, women & kids."
      />
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-start">
          <div className="rounded-2xl border border-border bg-cream p-8">
            <FileText className="h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Download the PDF</h2>
            <p className="mt-2 text-muted-foreground">
              Get the current-season linesheet with photos, MOQ, and lead times for every SKU.
              Updated quarterly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={waLink("Hi Anamon, please send me the latest wholesale catalog PDF.")}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep"
              >
                <Download className="h-4 w-4" /> Request PDF on WhatsApp
              </a>
              <a
                href={SITE.emailHref}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" /> Email us
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              PDF is shared on request for approved dealers. Dealer registration takes 2 minutes.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Browse by category</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/products"
                  search={{ category: c.slug, gender: undefined }}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-cream">
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.gender}
                    </div>
                    <div className="font-display text-sm font-semibold">{c.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
