import { Link } from "@tanstack/react-router";
import { BadgeCheck, ShieldCheck, Lock, Award, ArrowRight } from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";

interface TrustFooterProps {
  product: EnterpriseProduct;
  onClose?: () => void;
}

export function TrustFooter({ product, onClose }: TrustFooterProps) {
  return (
    <footer className="sticky bottom-0 z-30 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-white/95 px-6 py-3.5 backdrop-blur-md dark:bg-neutral-900/95">
      {/* Trust Badges */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <BadgeCheck className="h-4 w-4" /> Verified Manufacturer
        </span>
        <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
          <ShieldCheck className="h-4 w-4" /> SherSha Trade Assurance
        </span>
        <span className="flex items-center gap-1.5 text-foreground hidden sm:flex">
          <Lock className="h-3.5 w-3.5 text-amber-500" /> Secure B2B Escrow
        </span>
        <span className="flex items-center gap-1.5 text-foreground hidden md:flex">
          <Award className="h-3.5 w-3.5 text-purple-500" /> 100% Quality Guaranteed
        </span>
      </div>

      {/* Direct Full Product Page Link */}
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        search={{ category: undefined, gender: undefined }}
        onClick={onClose}
        className="group flex items-center gap-1.5 rounded-xl bg-secondary/80 px-4 py-2 text-xs font-bold text-foreground transition-all hover:bg-secondary hover:text-amber-500 shadow-sm"
      >
        <span>View Full Product Details</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </footer>
  );
}
