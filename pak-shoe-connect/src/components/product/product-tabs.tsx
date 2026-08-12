import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const TABS = [
  { id: "details", label: "Product Details" },
  { id: "company", label: "Company Profile" },
  { id: "reviews", label: "Reviews" },
  { id: "shipping", label: "Shipping" },
  { id: "faq", label: "FAQ" },
];

export function ProductTabs() {
  const [activeTab, setActiveTab] = useState("details");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Logic for sticking (could be fine-tuned based on exact hero height)
      if (window.scrollY > 600) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      // Intersection Observer logic could be added here for setting active tab
      // For simplicity in this anchor-linked setup, we let the user click to activate.
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      // scroll-mt-24 is defined on the sections, so standard scrollIntoView works well
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={cn(
      "w-full z-40 transition-all duration-300",
      isSticky ? "sticky top-14 glass border-b border-border shadow-sm" : "relative border-b border-border bg-background"
    )}>
      <div className="max-w-[1440px] mx-auto px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-8 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={cn(
                "relative py-4 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
