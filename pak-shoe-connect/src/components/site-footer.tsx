import { Link } from "@tanstack/react-router";
import { SITE, CATEGORY_NAV } from "@/lib/site";
import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink text-cream">
      {/* Newsletter / CTA Strip */}
      <div className="border-b border-cream/10 bg-emerald-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:py-12">
          <div>
            <h3 className="font-display text-xl font-bold text-white sm:text-2xl">Subscribe to Wholesale Updates</h3>
            <p className="mt-1 text-sm text-cream/80">Get notified about new catalog releases and seasonal discounts.</p>
          </div>
          <form className="flex w-full max-w-sm items-center gap-2" onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed! You\'ll receive wholesale updates.'); }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-cream/50 outline-none focus:border-white/50"
            />
            <button className="rounded-md bg-white px-5 py-2.5 text-sm font-bold text-emerald-deep transition hover:bg-cream">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-deep to-emerald text-white">
                <span className="font-display text-xl font-bold">{SITE.brand.charAt(0)}</span>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">{SITE.brand}</span>
            </Link>
            <p className="text-sm text-cream/70 leading-relaxed max-w-xs">
              {SITE.tagline}. Manufacturing premium footwear in Pakistan since {SITE.since}.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-cream/50 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-cream/50 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-cream/50 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-3 py-1 text-xs font-medium">
                <span className="text-gold">GSTN:</span> {SITE.gstn}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold text-white mb-6">Wholesale Categories</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-cream/70">
              {CATEGORY_NAV.slice(0, 10).map((c) => (
                <li key={c.slug}>
                  <Link to="/products" search={{ category: c.slug, gender: undefined }} className="hover:text-gold transition-colors flex items-center gap-1.5">
                    <span className="opacity-70">{c.icon}</span> {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-white mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-cream/70">
              <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/manufacturing" className="hover:text-gold transition-colors">Manufacturing Facility</Link></li>
              <li><Link to="/bulk-order" className="hover:text-gold transition-colors">Request Bulk Quote</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact Sales</Link></li>
              <li><Link to="/dashboard/buyer" className="hover:text-gold transition-colors">Buyer Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-cream/70">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-gold" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-gold" />
                <a href={SITE.phoneHref} className="hover:text-white transition-colors">{SITE.phone}</a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-gold" />
                <a href={SITE.emailHref} className="hover:text-white transition-colors">{SITE.email}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.brand} Footwear Industries. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">B2B Agreement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
