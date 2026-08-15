import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/dealer-registration")({
  component: DealerRegistration,
  head: () => ({
    meta: [
      { title: "Become a Dealer — Anamon Wholesale Footwear" },
      {
        name: "description",
        content:
          "Register as a Anamon wholesale dealer. Get approved buyer terms, factory rates and priority production slots. Registration takes 2 minutes.",
      },
      { property: "og:title", content: "Dealer Registration — Anamon" },
      { property: "og:url", content: "/dealer-registration" },
    ],
    links: [{ rel: "canonical", href: "/dealer-registration" }],
  }),
});

function DealerRegistration() {
  const [ok, setOk] = useState(false);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Dealer registration"
        title="Join 1,200+ Anamon dealers."
        description="Complete the form below. Once approved, you'll unlock wholesale prices, buyer terms and dedicated sales support."
      />
      <section className="mx-auto max-w-3xl px-4 py-14">
        {ok ? (
          <div className="rounded-2xl border border-emerald/30 bg-cream p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Application received</h2>
            <p className="mt-2 text-muted-foreground">
              Our team reviews new dealers within 1–2 working days. We'll contact you on the
              number you provided.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setOk(true); }}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <Row>
              <Field label="Business name" required><input required className={inp} /></Field>
              <Field label="Owner name" required><input required className={inp} /></Field>
            </Row>
            <Row>
              <Field label="Phone / WhatsApp" required><input required type="tel" placeholder="+92 3XX XXXXXXX" className={inp} /></Field>
              <Field label="Email"><input type="email" className={inp} /></Field>
            </Row>
            <Row>
              <Field label="City" required><input required className={inp} /></Field>
              <Field label="Business type" required>
                <select required defaultValue="" className={inp}>
                  <option value="" disabled>Select…</option>
                  <option>Retail shop</option>
                  <option>Multi-brand store</option>
                  <option>Online seller</option>
                  <option>Wholesaler</option>
                </select>
              </Field>
            </Row>
            <Field label="Shop address" required><textarea required rows={2} className={inp} /></Field>
            <Row>
              <Field label="NTN (optional)"><input className={inp} /></Field>
              <Field label="Years in business">
                <select className={inp} defaultValue="1-3">
                  <option>Less than 1</option>
                  <option>1-3</option>
                  <option>3-5</option>
                  <option>5-10</option>
                  <option>10+</option>
                </select>
              </Field>
            </Row>
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
