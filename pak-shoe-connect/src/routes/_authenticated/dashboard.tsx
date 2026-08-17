import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, FileText, MessageCircle, LogOut, User, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Buyer Dashboard — Anamom" }] }),
});

type Profile = {
  business_name: string;
  owner_name: string;
  phone: string;
  city: string | null;
  business_type: string | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      if (!u.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("business_name, owner_name, phone, city, business_type")
        .eq("id", u.user.id)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    })();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Buyer dashboard
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              Welcome{profile?.business_name ? `, ${profile.business_name}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Action
            to="/products"
            icon={<Package className="h-5 w-5" />}
            title="Browse Products"
            desc="Explore full wholesale catalog"
          />
          <Action
            to="/bulk-order"
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Bulk Order"
            desc="Place a new bulk order"
          />
          <Action
            to="/catalog"
            icon={<FileText className="h-5 w-5" />}
            title="Catalog PDF"
            desc="Download the latest catalog"
          />
          <Ext
            href={SITE.whatsappHref}
            icon={<MessageCircle className="h-5 w-5" />}
            title="Contact Sales"
            desc={`WhatsApp ${SITE.phone}`}
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Business profile</h2>
              <Link to="/profile" className="text-sm text-primary hover:underline">
                Edit
              </Link>
            </div>
            {profile ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Row k="Business" v={profile.business_name} />
                <Row k="Owner" v={profile.owner_name} />
                <Row k="Phone" v={profile.phone} />
                <Row k="City" v={profile.city ?? "—"} />
                <Row k="Type" v={profile.business_type ?? "—"} />
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-cream p-6">
            <User className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-base font-semibold">Approved buyer</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account is active. Wholesale pricing and buyer terms are unlocked.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Action({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-sm"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}
function Ext({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-sm"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </a>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 font-medium">{v}</dd>
    </div>
  );
}
