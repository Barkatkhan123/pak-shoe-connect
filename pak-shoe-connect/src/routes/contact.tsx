import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site-layout";
import { SITE } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact Anamom — Wholesale Footwear Sales Pakistan" },
      {
        name: "description",
        content:
          "Contact Anamom's wholesale sales team. Karachi factory office, phone, WhatsApp and email. Nationwide B2B footwear supply.",
      },
      { property: "og:title", content: "Contact — Anamom" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function Contact() {
  const [ok, setOk] = useState(false);
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Talk to our wholesale sales team." description="We respond within 1 working hour, 7 days a week." />
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <form
              onSubmit={(e) => { e.preventDefault(); setOk(true); toast.success('Message sent! Our team will contact you within 24 hours.'); }}
              className="space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              {ok ? (
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald" />
                  <h2 className="mt-4 font-display text-2xl font-semibold">Message sent</h2>
                  <p className="mt-2 text-muted-foreground">We'll be in touch shortly.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" required><input required className={inp} /></Field>
                    <Field label="Phone / WhatsApp" required><input required type="tel" className={inp} /></Field>
                  </div>
                  <Field label="Email"><input type="email" className={inp} /></Field>
                  <Field label="Company / shop name"><input className={inp} /></Field>
                  <Field label="Message" required><textarea required rows={5} className={inp} /></Field>
                  <button className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep">
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
          <div className="space-y-4">
            <ContactCard icon={Phone} title="Call us" value={SITE.phone} href={SITE.phoneHref} />
            <ContactCard icon={MessageCircle} title="WhatsApp" value="Fastest response" href={SITE.whatsappHref} accent />
            <ContactCard icon={Mail} title="Email" value={SITE.email} href={SITE.emailHref} />
            <div className="rounded-xl border border-border bg-cream p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <div className="font-semibold">Factory & Head Office</div>
                  <p className="mt-1 text-sm text-muted-foreground">{SITE.address}</p>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <iframe
                  title="Anamom factory location"
                  src={SITE.mapEmbed}
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
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
function ContactCard({ icon: Icon, title, value, href, accent }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string; href: string; accent?: boolean }) {
  return (
    <a href={href} className={`flex items-center gap-4 rounded-xl border p-5 transition hover:shadow-md ${accent ? "border-whatsapp/30 bg-whatsapp/5" : "border-border bg-card"}`}>
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${accent ? "bg-whatsapp text-white" : "bg-primary text-primary-foreground"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </a>
  );
}
