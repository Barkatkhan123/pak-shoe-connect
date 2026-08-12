import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Profile — Anamom" }] }),
});

const schema = z.object({
  business_name: z.string().trim().min(1).max(120),
  owner_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(30),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(300).optional(),
  business_type: z.string().max(40).optional(),
});

function ProfilePage() {
  const navigate = useNavigate();
  const [p, setP] = useState<z.infer<typeof schema> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (data) setP(data as z.infer<typeof schema>);
    })();
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid");
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", u.user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    navigate({ to: "/dashboard" });
  }

  if (!p) return <SiteLayout><div className="mx-auto max-w-2xl px-4 py-14 text-sm text-muted-foreground">Loading…</div></SiteLayout>;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold">Business profile</h1>
        <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <F label="Business name"><input name="business_name" defaultValue={p.business_name} required className={inp} /></F>
          <F label="Owner name"><input name="owner_name" defaultValue={p.owner_name} required className={inp} /></F>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Phone"><input name="phone" defaultValue={p.phone} required className={inp} /></F>
            <F label="City"><input name="city" defaultValue={p.city ?? ""} className={inp} /></F>
          </div>
          <F label="Business type">
            <select name="business_type" defaultValue={p.business_type ?? ""} className={inp}>
              <option value="">Select…</option>
              <option>Retail shop</option>
              <option>Multi-brand store</option>
              <option>Online seller</option>
              <option>Wholesaler</option>
            </select>
          </F>
          <F label="Address"><textarea name="address" defaultValue={p.address ?? ""} rows={2} className={inp} /></F>
          <button disabled={busy} className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep disabled:opacity-60">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

const inp = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
