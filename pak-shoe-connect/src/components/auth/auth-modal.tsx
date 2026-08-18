import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, ShoppingBag, ShieldCheck, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
  hasPendingItem?: boolean;
}

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  business_name: z.string().trim().min(1, "Business name is required").max(120),
  owner_name: z.string().trim().min(1, "Owner name is required").max(120),
  phone: z.string().trim().min(6, "Valid phone/WhatsApp required").max(30),
  city: z.string().trim().max(80).optional(),
});

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign in to continue",
  description = "Access wholesale pricing and add items to your B2B inquiry basket.",
  hasPendingItem = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setBusy(true);
    const { error, data } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);

    if (error) {
      const msg =
        error.message && error.message !== "{}" && error.message !== "[object Object]"
          ? error.message
          : "Failed to sign in. Please check your credentials.";
      toast.error(msg);
      return;
    }

    toast.success("Signed in successfully!");
    onClose();
    if (onSuccess) {
      onSuccess();
    }
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

    if (error) {
      const msg =
        error.message && error.message !== "{}" && error.message !== "[object Object]"
          ? error.message
          : "Failed to create account. Please check your details and try again.";
      toast.error(msg);
      return;
    }

    toast.success("Wholesale account created!");
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-card border-border">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            {hasPendingItem ? <ShoppingBag className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <DialogTitle className="font-display text-2xl text-center font-bold text-foreground">
            {title || (hasPendingItem ? "Sign in to Add to Basket" : "Sign in to continue")}
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground">
            {description ||
              (hasPendingItem
                ? "Your selected product, quantity, color, and size options have been saved. Sign in to automatically add this to your inquiry basket."
                : "Access wholesale pricing and add items to your B2B inquiry basket.")}
          </DialogDescription>
        </DialogHeader>

        {hasPendingItem && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-primary font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Product selection preserved • Auto-added upon login</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 rounded-lg border border-border p-1 bg-muted/40">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === "signin"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-md py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Business Email <span className="text-destructive">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="buyer@shoestore.pk"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-emerald-deep transition-all cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {busy ? "Signing in..." : hasPendingItem ? "Sign In & Add to Basket" : "Sign In"}
            </button>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>New to Anamon?</span>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Register as Buyer
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Business Name *
                </label>
                <input
                  name="business_name"
                  required
                  placeholder="Shoe Point"
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Owner Name *
                </label>
                <input
                  name="owner_name"
                  required
                  placeholder="Muhammad"
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="owner@store.pk"
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+92 300 1234567"
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-emerald-deep transition-all cursor-pointer disabled:opacity-60 shadow-sm mt-2"
            >
              {busy ? "Creating account..." : "Register & Add to Basket"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
