import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageHero, SiteLayout } from "@/components/site-layout";
import { getPendingAction } from "@/hooks/use-inquiry-basket";
import { toast } from "sonner";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Anamom Wholesale" },
      { name: "description", content: "Sign in or create your Anamom wholesale buyer account." },
    ],
  }),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  business_name: z.string().trim().min(1, "Required").max(120),
  owner_name: z.string().trim().min(1, "Required").max(120),
  phone: z.string().trim().min(6, "Enter phone").max(30),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(300).optional(),
  business_type: z.string().max(40).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingItem, setPendingItem] = useState(() => getPendingAction());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const dest = search.redirect || (getPendingAction() ? "/checkout" : "/dashboard");
        navigate({ to: dest as any, replace: true });
      }
    });
  }, [navigate, search.redirect]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    const dest = search.redirect || (getPendingAction() ? "/checkout" : "/dashboard");
    navigate({ to: dest as any, replace: true });
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { email, password, ...profile } = parsed.data;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: profile,
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    const dest = search.redirect || (getPendingAction() ? "/checkout" : "/dashboard");
    navigate({ to: dest as any, replace: true });
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Buyer portal"
        title={mode === "signin" ? "Sign in to your account" : "Create your wholesale account"}
        description="Access wholesale prices, place bulk orders, and track your quotations."
      />
      <section className="mx-auto max-w-md px-4 py-14">
        <div className="mb-6 grid grid-cols-2 rounded-lg border border-border p-1">
          <button
            onClick={() => setMode("signin")}
            className={`rounded-md py-2 text-sm font-medium ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`rounded-md py-2 text-sm font-medium ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
          >
            Sign up
          </button>
        </div>

        {pendingItem && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary font-medium shadow-xs">
            <ShoppingBag className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-foreground">Pending Selection Saved</p>
              <p className="text-muted-foreground mt-0.5">
                {pendingItem.requestedQty} pairs of <strong>{pendingItem.name}</strong> ({pendingItem.color}, {pendingItem.size}) will be automatically added to your basket upon sign in.
              </p>
            </div>
          </div>
        )}

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Field label="Email"><input name="email" type="email" required className={inp} /></Field>
            <Field label="Password">
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required className={inp} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <button disabled={busy} className={btn}>{busy ? "Signing in…" : "Sign in"}</button>
            <p className="text-center text-xs text-muted-foreground">
              New buyer?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">
                Create an account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <Field label="Business name" required><input name="business_name" required className={inp} /></Field>
            <Field label="Owner name" required><input name="owner_name" required className={inp} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" required><input name="email" type="email" required className={inp} /></Field>
              <Field label="Phone / WhatsApp" required><input name="phone" type="tel" required placeholder="+92 3XX XXXXXXX" className={inp} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City"><input name="city" className={inp} /></Field>
              <Field label="Business type">
                <select name="business_type" defaultValue="" className={inp}>
                  <option value="">Select…</option>
                  <option>Retail shop</option>
                  <option>Multi-brand store</option>
                  <option>Online seller</option>
                  <option>Wholesaler</option>
                </select>
              </Field>
            </div>
            <Field label="Shop address"><textarea name="address" rows={2} className={inp} /></Field>
            <Field label="Password" required>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required minLength={6} className={inp} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <button disabled={busy} className={btn}>{busy ? "Creating…" : "Create account"}</button>
            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link to="/contact" className="text-primary hover:underline">terms</Link>.
            </p>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

const inp = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const btn = "w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep disabled:opacity-60";

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
