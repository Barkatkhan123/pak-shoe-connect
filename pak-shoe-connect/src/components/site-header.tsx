import { Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  MessageCircle,
  ArrowRight,
  Heart,
  Package,
  ChevronDown,
  Search,
  Building,
  Factory,
  FileText,
  PhoneCall,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { count: wishlistCount } = useWishlist();
  const { count: inquiryCount } = useInquiryBasket();

  // Detect scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route navigation
  const router = useRouter();
  useEffect(() => {
    const unsub = router.subscribe("onBeforeNavigate", () => {
      setMegaMenuOpen(false);
      setOpen(false);
      setMobileSearchOpen(false);
    });
    return unsub;
  }, [router]);

  // Escape key closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaMenuOpen(false);
        setOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Open inquiry basket drawer on custom event
  useEffect(() => {
    const onOpenInquiry = () => setInquiryOpen(true);
    window.addEventListener("shersha:open-inquiry-drawer", onOpenInquiry);
    return () => window.removeEventListener("shersha:open-inquiry-drawer", onOpenInquiry);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-[100] w-full max-w-full border-b-2 border-gold bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-md" : "shadow-xs"
        }`}
      >
        {/* ── Slim 28px Announcement Bar ── */}
        <div className="w-full bg-[#0F1A13] text-[#FAF7F2] text-[11px] font-medium tracking-wide safe-top border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 h-7 min-h-[28px]">
            <p className="flex items-center gap-1.5 truncate text-[11px]">
              <span aria-hidden className="text-xs shrink-0">🇵🇰</span>
              <span className="truncate font-semibold">Premium Footwear Manufacturing · Delivery across Pakistan</span>
            </p>
            <div className="flex items-center gap-4 shrink-0 text-[11px]">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-gold font-bold">PKR</span>
                <span className="w-px h-2.5 bg-white/20" />
                <span>Nationwide TCS / Leopards Logistics</span>
              </div>
              <a
                href={SITE.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#25D366] hover:text-white transition-colors font-bold"
                aria-label="Direct WhatsApp Sales Helpline"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline">WhatsApp</span> {SITE.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ── Main Sticky Navigation Bar ── */}
        <div className="w-full bg-white relative z-[100]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 h-16 sm:h-[72px]">
            
            {/* Logo (44px touch target) */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 min-h-[44px] py-1 group" aria-label="Anamon Home">
              <div
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded shadow-xs transition-transform group-hover:scale-105"
                style={{ background: "#1B4332" }}
              >
                <span className="font-display text-lg sm:text-xl font-bold text-[#C9A84C]">
                  {SITE.brand.charAt(0)}
                </span>
              </div>
              <div className="leading-none">
                <div className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0F1A13]">
                  {SITE.brand}
                </div>
                <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#8B5E3C] mt-0.5">
                  B2B Wholesale
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-foreground transition-all"
                activeProps={{ className: "text-[#1B4332] bg-[#1B4332]/10" }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
              
              {/* Desktop Mega Menu Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <Link
                  to="/products"
                  search={{ category: undefined, gender: undefined }}
                  className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-foreground transition-all ${
                    megaMenuOpen ? "text-[#1B4332] bg-[#1B4332]/10" : ""
                  }`}
                >
                  <span>Wholesale Catalog</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`} />
                </Link>

                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-full left-0 w-[640px] pt-2"
                    >
                      <div className="rounded-2xl border border-[#E0D9CE] bg-white p-6 shadow-xl grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-3">
                            Men's Categories
                          </h4>
                          <ul className="space-y-1">
                            {CATEGORY_NAV.filter((c) => c.slug.startsWith("men")).map((c) => (
                              <li key={c.slug}>
                                <Link
                                  to="/products"
                                  search={{ category: c.slug, gender: undefined }}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-[#FAF7F2] transition-colors"
                                >
                                  <span className="text-base">{c.icon}</span>
                                  <span className="text-xs font-bold text-foreground">{c.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-3">
                            Women, Kids & Specialty
                          </h4>
                          <ul className="space-y-1">
                            {CATEGORY_NAV.filter((c) => !c.slug.startsWith("men")).map((c) => (
                              <li key={c.slug}>
                                <Link
                                  to="/products"
                                  search={{ category: c.slug, gender: undefined }}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-[#FAF7F2] transition-colors"
                                >
                                  <span className="text-base">{c.icon}</span>
                                  <span className="text-xs font-bold text-foreground">{c.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
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
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground/80 hover:bg-black/5 hover:text-foreground transition-all"
                  activeProps={{ className: "text-[#1B4332] bg-[#1B4332]/10" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Action Icons (Accessible 44px Touch Targets) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <SearchCommand />

              {/* Wishlist Link */}
              <Link
                to="/dashboard/buyer"
                className="relative flex h-11 w-11 items-center justify-center text-foreground/70 hover:text-primary hover:bg-black/5 rounded-full transition-all"
                title="Wishlist"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Inquiry Basket Trigger */}
              <button
                onClick={() => setInquiryOpen(true)}
                className="relative flex h-11 items-center gap-1.5 px-2.5 text-foreground/70 hover:text-primary hover:bg-black/5 rounded-full transition-all cursor-pointer"
                title="Inquiry Basket"
                aria-label={`Inquiry Basket with ${inquiryCount} items`}
              >
                <Package className="h-5 w-5" />
                <span className="hidden md:inline text-xs font-bold text-[#0F1A13]">Inquiry</span>
                {inquiryCount > 0 && (
                  <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#1B4332] text-[9px] font-bold text-white shadow-xs animate-badge-pop">
                    {inquiryCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger (44px target) */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="grid h-11 w-11 place-items-center rounded-full text-foreground hover:bg-black/5 lg:hidden transition-colors cursor-pointer"
                aria-label={open ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={open}
              >
                {open ? <X className="h-6 w-6 text-[#0F1A13]" /> : <Menu className="h-6 w-6 text-[#0F1A13]" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile Full-Height Structured Drawer ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 w-full border-t border-[#E0D9CE] bg-white lg:hidden shadow-2xl max-h-[calc(100dvh-5.5rem)] overflow-y-auto z-[100]"
            >
              <div className="flex flex-col p-4 sm:p-6 space-y-6">
                
                {/* 1. Quick Wholesale Search Link / Trigger */}
                <div className="relative">
                  <Link
                    to="/products"
                    search={{ category: undefined, gender: undefined }}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[#E0D9CE] bg-[#FAF7F2] px-4 py-3 text-xs font-bold text-muted-foreground"
                  >
                    <Search className="h-4 w-4 text-[#8B5E3C]" />
                    <span>Search all 200+ footwear models...</span>
                  </Link>
                </div>

                {/* 2. Shop by Category Thumbnails */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-3">
                    Wholesale Categories
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_NAV.map((c) => (
                      <Link
                        key={c.slug}
                        to="/products"
                        search={{ category: c.slug, gender: undefined }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E0D9CE] bg-white hover:bg-[#FAF7F2] transition-colors"
                      >
                        <span className="text-base shrink-0">{c.icon}</span>
                        <span className="text-xs font-bold text-foreground truncate">{c.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 3. Company & Trade Navigation */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B5E3C] mb-3">
                    Company & Trade Programs
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/about"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-[#0F1A13] hover:bg-[#FAF7F2]"
                    >
                      <Building className="h-4 w-4 text-[#1B4332]" />
                      <span>About Anamon Footwear</span>
                    </Link>
                    <Link
                      to="/manufacturing"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-[#0F1A13] hover:bg-[#FAF7F2]"
                    >
                      <Factory className="h-4 w-4 text-[#1B4332]" />
                      <span>Manufacturing Facilities</span>
                    </Link>
                    <Link
                      to="/become-distributor"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-[#0F1A13] hover:bg-[#FAF7F2]"
                    >
                      <UserCheck className="h-4 w-4 text-[#1B4332]" />
                      <span>Become a Regional Dealer</span>
                    </Link>
                    <Link
                      to="/dashboard/buyer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-[#0F1A13] hover:bg-[#FAF7F2]"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Buyer Wishlist ({wishlistCount})</span>
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-[#0F1A13] hover:bg-[#FAF7F2]"
                    >
                      <PhoneCall className="h-4 w-4 text-[#1B4332]" />
                      <span>Contact Sales & Support</span>
                    </Link>
                  </div>
                </div>

                {/* 4. Pinned Bottom CTA */}
                <div className="pt-2">
                  <Link
                    to="/bulk-order"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-4 py-3.5 text-sm font-bold text-[#FAF7F2] shadow-md hover:bg-[#C9A84C] hover:text-[#0F1A13] transition-all"
                  >
                    <span>Request Wholesale Quote (RFQ)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <InquiryDrawer isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
