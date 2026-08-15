import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Palette, PackageCheck, Ruler, Sparkles, Tag } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/oem")({
  component: OEM,
  head: () => ({
    meta: [
      { title: "OEM & Private Label Footwear Manufacturing — Anamon Pakistan" },
      {
        name: "description",
        content:
          "Launch your own shoe brand with Anamon. Private label manufacturing from 300 pairs — custom logo, box, packaging, and full design customization.",
      },
      { property: "og:title", content: "OEM / Private Label — Anamon" },
      { property: "og:url", content: "/oem" },
    ],
    links: [{ rel: "canonical", href: "/oem" }],
  }),
});

function OEM() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="OEM / Private Label"
        title="Your brand, on every pair."
        description="Anamon manufactures footwear under your own label — from sampling to branded packaging."
      />
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Ruler, title: "Design customization", body: "Bring your tech-pack or work with our design team on lasts, patterns, colors and materials." },
            { icon: Tag, title: "Custom logo", body: "Debossed, printed or metal-tag branding on upper, insole, sole and packaging." },
            { icon: Boxes, title: "Custom box & packaging", body: "Printed shoeboxes, dust bags, tissue paper, hangtags — designed and produced in-house." },
            { icon: Palette, title: "Material sourcing", body: "Genuine leather, PU, canvas, mesh, suede — sourced from certified Pakistani tanneries." },
            { icon: PackageCheck, title: "Sample in 7 days", body: "Approved sampling process before production. Revisions included." },
            { icon: Sparkles, title: "Small MOQ", body: "Private label from 300 pairs per style. Scale up as your brand grows." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              ["01", "Brief", "Share your design ideas, quantities and target price."],
              ["02", "Sample", "We produce a paid sample within 7 days for approval."],
              ["03", "Production", "Bulk manufacturing under 3-stage QC (15–25 days)."],
              ["04", "Dispatch", "Branded packing and nationwide/export freight."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-xl border border-border bg-background p-6">
                <div className="font-display text-3xl font-semibold text-primary">{n}</div>
                <div className="mt-2 font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link
              to="/bulk-order"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep"
            >
              Start a private label order <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
