import { useState, useEffect } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { AuthModal } from "./auth/auth-modal";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { useScroll, useTransform, motion } from "framer-motion";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalDetail, setAuthModalDetail] = useState<{
    hasPendingItem?: boolean;
    title?: string;
    description?: string;
    mode?: "signin" | "signup";
  }>({});

  useEffect(() => {
    const onOpenAuth = (e: any) => {
      setAuthModalDetail(e.detail || {});
      setAuthModalOpen(true);
    };
    window.addEventListener("shersha:open-auth-modal", onOpenAuth);
    return () => window.removeEventListener("shersha:open-auth-modal", onOpenAuth);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col w-full max-w-full overflow-x-hidden bg-[#FAF7F2]">
      {/* Scroll progress indicator */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1B4332] to-[#C9A84C] z-[110] pointer-events-none"
      />

      <SiteHeader />

      {/* Header spacer to prevent page content from hiding behind fixed header */}
      <div className="h-[92px] sm:h-[100px] w-full shrink-0" aria-hidden="true" />

      {/* Main content with bottom padding clearance for floating WhatsApp button */}
      <main className="flex-1 w-full max-w-full pb-20 md:pb-8">{children}</main>

      <SiteFooter />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        hasPendingItem={authModalDetail.hasPendingItem}
        title={authModalDetail.title}
        description={authModalDetail.description}
        initialMode={authModalDetail.mode}
      />

      {/* Global WhatsApp FAB (Mobile-safe, non-obstructing) */}
      <a
        href={SITE.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat with Sales Team on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
      </a>

      {/* Global Mobile Bottom App Navigation Bar (Thumb Zone HCI) */}
      <MobileBottomNav />
    </div>
  );
}

export function PageHero({
  title,
  description,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-[#0F1A13] py-8 sm:py-12 md:py-16 border-b border-[#E0D9CE]">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        {eyebrow && (
          <p className="mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            {eyebrow}
          </p>
        )}
        <h1 className="mx-auto max-w-3xl font-display text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-[#FAF7F2]">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm md:text-base text-[#FAF7F2]/80 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
