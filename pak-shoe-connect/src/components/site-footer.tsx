import { Link } from "@tanstack/react-router";
import { SITE, CATEGORY_NAV } from "@/lib/site";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Factory,
  ShieldCheck,
  Truck,
  Package,
  Globe,
  ChevronDown,
  Award,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SiteFooter() {
  // Mobile accordion toggle states (company section open by default so contact details are immediately visible)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    factory: false,
    categories: false,
    company: true,
    contact: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer className="border-t border-[#E0D9CE] bg-[#0F1A13] text-[#FAF7F2]">
      {/* ── Wholesale Newsletter / Quick RFQ Strip ── */}
      <div className="border-b border-white/10 bg-[#1B4332]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:py-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A84C] mb-1">
              <Award className="h-3.5 w-3.5" />
              <span>B2B Wholesale Bulletin</span>
            </div>
            <h3 className="font-display text-xl font-bold text-[#FAF7F2] sm:text-2xl">
              Subscribe to Trade Updates & Price Lists
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#FAF7F2]/80">
              Get notified first on factory catalog releases, volume discounts, and seasonal
              clearance batches.
            </p>
          </div>
          <form
            className="flex w-full max-w-md items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(
                "Subscribed! You'll receive wholesale price sheets and catalog releases.",
              );
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter business email..."
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-bold text-[#0F1A13] transition hover:bg-[#C9A84C]/90 cursor-pointer shrink-0 shadow-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* ── Main Footer Links & Information Grid ── */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Col 1: Brand & Positioning (Full span on mobile) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div
                className="grid h-10 w-10 place-items-center rounded shadow-xs"
                style={{ background: "#1B4332" }}
              >
                <span className="font-display text-xl font-bold text-[#C9A84C]">A</span>
              </div>
              <div className="leading-none">
                <span className="font-display text-2xl font-bold tracking-tight text-white">
                  {SITE.fullName || "Anamon Official"}
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A84C] mt-0.5">
                  B2B Wholesale Footwear Manufacturer
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#FAF7F2]/80 leading-relaxed max-w-sm">
              Anamon Official manufactures premium leather and rexine footwear for global B2B buyers.
              Bulk orders, custom branding, and reliable worldwide shipping.
            </p>

            {/* Direct Contact Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 hover:text-[#C9A84C] transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>{SITE.phone}</span>
              </a>
              <a
                href={SITE.emailHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 hover:text-[#C9A84C] transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>{SITE.email}</span>
              </a>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={SITE.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                aria-label="WhatsApp Sales Support"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>

            {/* Business Verification Badge */}
            <div className="pt-2 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/90">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>GSTN: {SITE.gstn || "PK-3029481-9"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/90">
                <Factory className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span>Est. 1998 · 25+ Yrs</span>
              </div>
            </div>
          </div>

          {/* Col 2: Factory & Manufacturing Details (Collapsible on mobile) */}
          <div className="border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
            <button
              onClick={() => toggleSection("factory")}
              className="flex w-full items-center justify-between font-display text-sm sm:text-base font-bold text-white md:cursor-default"
            >
              <span>Manufacturing & Specs</span>
              <ChevronDown
                className={`h-4 w-4 text-[#C9A84C] transition-transform md:hidden ${
                  openSections.factory ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`mt-3 space-y-2.5 text-xs text-[#FAF7F2]/80 md:block ${openSections.factory ? "block" : "hidden"}`}
            >
              <div className="flex items-start gap-2">
                <Factory className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Plants:</strong> Rawalpindi & Lahore, Pakistan
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Capacity:</strong> 15,000+ pairs/mo
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">MOQ & Lead:</strong> Min 12 prs (multiples of 12) ·
                  3–5 days dispatch
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Export:</strong> GCC, UK & East Africa
                </div>
              </div>
              <div className="pt-1">
                <Link
                  to="/manufacturing"
                  className="text-xs font-bold text-[#C9A84C] hover:underline inline-flex items-center gap-1"
                >
                  Factory Tour & Specs →
                </Link>
              </div>
            </div>
          </div>

          {/* Col 3: Footwear Categories Grid (Collapsible on mobile) */}
          <div className="border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
            <button
              onClick={() => toggleSection("categories")}
              className="flex w-full items-center justify-between font-display text-sm sm:text-base font-bold text-white md:cursor-default"
            >
              <span>Wholesale Lines</span>
              <ChevronDown
                className={`h-4 w-4 text-[#C9A84C] transition-transform md:hidden ${
                  openSections.categories ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`mt-3 grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-[#FAF7F2]/80 md:grid ${openSections.categories ? "grid" : "hidden"}`}
            >
              {CATEGORY_NAV.slice(0, 10).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/products"
                    search={{ category: c.slug, gender: undefined }}
                    className="hover:text-[#C9A84C] transition-colors flex items-center gap-1 py-0.5"
                  >
                    <span className="opacity-75 text-[11px]">{c.icon}</span>
                    <span className="truncate">{c.label}</span>
                  </Link>
                </li>
              ))}
              <li className="col-span-2 pt-1">
                <Link
                  to="/products"
                  search={{ category: undefined, gender: undefined }}
                  className="text-xs font-bold text-[#C9A84C] hover:underline"
                >
                  All 10+ Wholesale Lines →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Contact (Collapsible on mobile) */}
          <div className="border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
            <button
              onClick={() => toggleSection("company")}
              className="flex w-full items-center justify-between font-display text-sm sm:text-base font-bold text-white md:cursor-default"
            >
              <span>Company & Sales</span>
              <ChevronDown
                className={`h-4 w-4 text-[#C9A84C] transition-transform md:hidden ${
                  openSections.company ? "rotate-180" : ""
                }`}
              />
            </button>
            <ul
              className={`mt-3 space-y-2 text-xs text-[#FAF7F2]/80 md:block ${openSections.company ? "block" : "hidden"}`}
            >
              <li>
                <Link to="/about" className="hover:text-[#C9A84C] transition-colors block py-0.5">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/manufacturing"
                  className="hover:text-[#C9A84C] transition-colors block py-0.5"
                >
                  Manufacturing Facility
                </Link>
              </li>
              <li>
                <Link
                  to="/bulk-order"
                  className="hover:text-[#C9A84C] transition-colors block py-0.5"
                >
                  Request Bulk Quote (RFQ)
                </Link>
              </li>
              <li>
                <Link
                  to="/become-distributor"
                  className="hover:text-[#C9A84C] transition-colors block py-0.5"
                >
                  Become a Regional Dealer
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/buyer"
                  className="hover:text-[#C9A84C] transition-colors block py-0.5"
                >
                  Buyer Portal & Tracking
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10">
                <a
                  href={SITE.phoneHref}
                  className="flex items-center gap-2 text-white hover:text-[#C9A84C]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#C9A84C]" />
                  <span>{SITE.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.emailHref}
                  className="flex items-center gap-2 text-white/90 hover:text-[#C9A84C]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
                  <span>{SITE.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Legal & Copyright Bar ── */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 pt-6 pb-[150px] sm:pb-8 text-xs text-[#FAF7F2]/70 sm:flex-row">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-xs text-[#FAF7F2]/80">
              © {new Date().getFullYear()} {SITE.fullName || SITE.brand} Footwear Industries. All rights reserved.
            </p>
            <span className="hidden sm:inline text-white/30">•</span>
            {/* Dedicated 50px Height Badge for Made with White Heart by Barkat */}
            <div className="min-h-[50px] h-[50px] px-4 py-2 rounded-xl bg-white/10 border border-white/15 inline-flex items-center justify-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold text-[#FAF7F2]">Made with</span>
              <span className="text-base leading-none text-white">🤍</span>
              <span className="text-xs font-semibold text-[#FAF7F2]">by</span>
              <span className="text-sm font-bold text-[#C9A84C] tracking-wide">Barkat</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">·</span>
            <Link to="/bulk-order" className="hover:text-white transition-colors">
              B2B Terms
            </Link>
            <span className="text-white/20">·</span>
            <Link to="/contact" className="hover:text-white transition-colors">
              Trade Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
