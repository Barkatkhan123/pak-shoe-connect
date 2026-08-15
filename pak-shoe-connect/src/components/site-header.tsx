import { Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, ArrowRight, Heart, Package, ChevronDown } from "lucide-react";
import { NAV, SITE, CATEGORY_NAV } from "@/lib/site";
import { useWishlist } from "@/hooks/use-wishlist";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { SearchCommand } from "./search-command";
import { InquiryDrawer } from "./inquiry-drawer";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { count: wishlistCount } = useWishlist();
  const { count: inquiryCount } = useInquiryBasket();

  // Detect scroll for dynamic header background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega menu on route change
  const router = useRouter();
  useEffect(() => {
    const unsub = router.subscribe('onBeforeNavigate', () => {
      setMegaMenuOpen(false);
      setOpen(false);
    });
    return unsub;
  }, [router]);

  // Keyboard: Escape closes all menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* ── Top utility bar ── */}
      <div className="bg-ink text-white/90 text-[11px] font-medium tracking-wide">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 sm:py-2">
          <p className="flex items-center gap-2 truncate opacity-90">
            <span aria-hidden className="text-[13px]">🇵🇰</span> 
            Premium Footwear Manufacturing · Delivery across Pakistan
          </p>
          <div className="flex items-center gap-5 shrink-0">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-gold font-bold">PKR</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="cursor-pointer hover:text-white transition">English</span>
              <span className="cursor-pointer opacity-60 hover:opacity-100 transition font-urdu">اردو</span>
            </div>
            <a href={SITE.whatsappHref} className="hidden sm:flex items-center gap-1.5 hover:text-whatsapp transition">
              <MessageCircle className="h-3.5 w-3.5" /> 
              <span>WhatsApp {SITE.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Glass Header ── */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "glass shadow-sm border-b border-white/20 py-2.5" : "bg-white border-b border-border py-4"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white premium-shadow transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary">
              <span className="font-display text-xl font-bold">{SITE.brand.charAt(0)}</span>
            </div>
            <div className="leading-none mt-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-ink">{SITE.brand}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                B2B Marketplace
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-black/5 hover:text-foreground transition-all"
              activeProps={{ className: "text-primary bg-primary/5" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            
            {/* Mega Menu Toggle */}
            <div 
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                onClick={() => setMegaMenuOpen(v => !v)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-black/5 hover:text-foreground transition-all ${megaMenuOpen ? 'text-primary bg-primary/5' : ''}`}
              >
                Catalog <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${megaMenuOpen ? "rotate-180" : ""}`} />
              </button>
              
              {/* Mega Menu Dropdown */}
              <AnimatePresence>
              {megaMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[680px] pt-4"
                >
                  <div className="rounded-2xl border border-white bg-white/95 backdrop-blur-3xl p-6 premium-shadow-lg grid grid-cols-[1fr_1fr_240px] gap-8 origin-top">
                    {/* Col 1 */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Men's Collection</h3>
                      <ul className="space-y-1">
                        {CATEGORY_NAV.filter(c => c.slug.startsWith('men')).map(c => (
                          <li key={c.slug}>
                            <Link to="/products" search={{ category: c.slug, gender: undefined }} onClick={() => setMegaMenuOpen(false)} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-black/5 transition-colors">
                              <span className="grid h-8 w-8 place-items-center rounded-md bg-white premium-shadow text-xl group-hover:scale-110 transition-transform">
                                {c.icon}
                              </span>
                              <span className="text-sm font-semibold text-foreground/80 group-hover:text-primary">{c.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Col 2 */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">Women & Kids</h3>
                      <ul className="space-y-1">
                        {CATEGORY_NAV.filter(c => c.slug.startsWith('women') || c.slug.startsWith('kids')).map(c => (
                          <li key={c.slug}>
                            <Link to="/products" search={{ category: c.slug, gender: undefined }} onClick={() => setMegaMenuOpen(false)} className="group flex items-center gap-3 rounded-lg p-2 hover:bg-black/5 transition-colors">
                              <span className="grid h-8 w-8 place-items-center rounded-md bg-white premium-shadow text-xl group-hover:scale-110 transition-transform">
                                {c.icon}
                              </span>
                              <span className="text-sm font-semibold text-foreground/80 group-hover:text-primary">{c.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Col 3 Banner */}
                    <div className="relative overflow-hidden rounded-xl bg-ink p-5 text-white flex flex-col justify-end">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80')] opacity-30 mix-blend-luminosity object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
                      <div className="relative z-10">
                        <span className="mb-2 inline-block rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                          OEM Services
                        </span>
                        <h4 className="font-display text-lg font-bold leading-tight">Private Label Manufacturing</h4>
                        <Link to="/bulk-order" onClick={() => setMegaMenuOpen(false)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-white transition-colors">
                          Get a Quote <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {NAV.slice(2).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-black/5 hover:text-foreground transition-all"
                activeProps={{ className: "text-primary bg-primary/5" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <SearchCommand />
            
            <Link to="/dashboard/buyer" className="hidden sm:flex relative p-2.5 text-foreground/70 hover:text-primary hover:bg-black/5 rounded-full transition-all" title="Wishlist">
              <Heart className="h-[22px] w-[22px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setInquiryOpen(true)}
              className="relative flex items-center gap-2 p-2.5 text-foreground/70 hover:text-primary hover:bg-black/5 rounded-full lg:rounded-xl transition-all" 
              title="Inquiry Basket"
            >
              <Package className="h-[22px] w-[22px]" />
              <span className="hidden lg:inline text-sm font-bold mr-1">Inquiry</span>
              {inquiryCount > 0 && (
                <span className="absolute top-1.5 right-1.5 lg:-top-1.5 lg:-right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-badge-pop">
                  {inquiryCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-black/5 lg:hidden transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-full border-t border-border bg-white/95 backdrop-blur-xl lg:hidden premium-shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-4 space-y-2">
              {NAV.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3.5 text-sm font-bold hover:bg-black/5 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Link
                to="/dashboard/buyer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold hover:bg-black/5 transition-colors"
              >
                <Heart className="h-5 w-5 text-rose-500" /> Wishlist ({wishlistCount})
              </Link>
              <Link
                to="/bulk-order"
                onClick={() => setOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-bold text-white premium-shadow"
              >
                Request Wholesale Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </motion.div>
        )}
        </AnimatePresence>
      </header>

      <InquiryDrawer isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
