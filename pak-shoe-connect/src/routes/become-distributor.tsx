import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/become-distributor")({
  component: BecomeDistributor,
  head: () => ({
    meta: [
      { title: "Become a Distributor — Anamon Wholesale Footwear Pakistan" },
      {
        name: "description",
        content:
          "Partner with Anamon as a regional distributor. Exclusive territory, factory rates and dedicated support for large-scale buyers.",
      },
      { property: "og:title", content: "Distributor Program — Anamon" },
      { property: "og:url", content: "/become-distributor" },
    ],
    links: [{ rel: "canonical", href: "/become-distributor" }],
  }),
});

function BecomeDistributor() {
  const [ok, setOk] = useState(false);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Distributor program"
        title="Become a Anamon regional distributor."
        description="For larger partners with existing distribution networks, warehousing and monthly volume commitments."
      />
      <section className="mx-auto max-w-3xl px-4 py-14">
        {ok ? (
          <div className="rounded-2xl border border-emerald/30 bg-cream p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Application received</h2>
            <p className="mt-2 text-muted-foreground">
              Our business development team reviews distributor applications within 3–5 working days.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setOk(true); }}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <h2 className="font-display text-xl font-semibold">Business information</h2>
            <Row>
              <Field label="Company name" required><input required className={inp} /></Field>
              <Field label="Contact person" required><input required className={inp} /></Field>
            </Row>
            <Row>
              <Field label="Phone / WhatsApp" required><input required type="tel" className={inp} /></Field>
              <Field label="Email" required><input required type="email" className={inp} /></Field>
            </Row>
            <Field label="NTN"><input className={inp} /></Field>

            <h2 className="font-display text-xl font-semibold pt-4">Distribution</h2>
            <Field label="Distribution area / territory" required>
              <input required placeholder="e.g. Punjab / Sindh / KPK / Islamabad" className={inp} />
            </Field>
            <Field label="Warehouse details" required>
              <textarea required rows={3} placeholder="Location, size (sq ft), storage capacity…" className={inp} />
            </Field>
            <Row>
              <Field label="Expected monthly sales" required>
                <select required defaultValue="" className={inp}>
                  <option value="" disabled>Select…</option>
                  <option>Under 1,000 pairs</option>
                  <option>1,000 – 5,000 pairs</option>
                  <option>5,000 – 20,000 pairs</option>
                  <option>20,000+ pairs</option>
                </select>
              </Field>
              <Field label="Years in distribution">
                <select className={inp} defaultValue="3-5">
                  <option>1-3</option>
                  <option>3-5</option>
                  <option>5-10</option>
                  <option>10+</option>
                </select>
              </Field>
            </Row>
            <Field label="Existing brands handled">
              <textarea rows={2} placeholder="Other footwear or apparel brands you currently distribute" className={inp} />
            </Field>
            <button className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep">
              Submit Application
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

const inp = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
