import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import { useScroll, useTransform, motion } from "framer-motion";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <motion.div
        style={{ scaleX, transformOrigin: 'left' }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-gold z-[60]"
      />
      <SiteHeader />
      <main className="flex-1 animate-page-enter">{children}</main>
      <SiteFooter />
      
      {/* Global WhatsApp FAB */}
      <a 
        href={SITE.whatsappHref} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-fab"
        aria-label="Chat with Sales on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
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
    <div className="relative overflow-hidden bg-ink py-16 md:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 text-center">
        {eyebrow && (
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold animate-slide-up">
            {eyebrow}
          </p>
        )}
        <h1 className="mx-auto max-w-4xl text-balance font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl animate-slide-up" style={{animationDelay: "0.1s"}}>
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-cream/80 sm:text-lg animate-slide-up" style={{animationDelay: "0.2s"}}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
