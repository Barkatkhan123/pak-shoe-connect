import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Package, ShoppingBag, Truck, User } from "lucide-react";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useAuth } from "@/hooks/use-auth";

export function MobileBottomNav() {
  const { totalPairs } = useInquiryBasket();
  const { isAuthenticated } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const handleOpenInquiry = () => {
    window.dispatchEvent(new CustomEvent("shersha:open-inquiry-drawer"));
  };

  const handleOpenAuth = () => {
    if (isAuthenticated) {
      window.location.href = "/dashboard/buyer";
    } else {
      window.dispatchEvent(
        new CustomEvent("shersha:open-auth-modal", {
          detail: { title: "Wholesale Buyer Account", mode: "signin" },
        }),
      );
    }
  };

  const isHome = pathname === "/";
  const isCatalog = pathname.startsWith("/products") || pathname.startsWith("/catalog");
  const isTracking = pathname.startsWith("/tracking");
  const isAccount = pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/auth");

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0D9CE] shadow-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-1">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isHome ? "text-[#1B4332] font-bold" : "text-[#5C6B5A] hover:text-[#0F1A13]"
          }`}
          aria-label="Home page"
        >
          <Home className={`h-5 w-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </Link>

        {/* 2. Catalog */}
        <Link
          to="/products"
          search={{ category: undefined, gender: undefined }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isCatalog ? "text-[#1B4332] font-bold" : "text-[#5C6B5A] hover:text-[#0F1A13]"
          }`}
          aria-label="Wholesale Catalog"
        >
          <Package className={`h-5 w-5 ${isCatalog ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Catalog</span>
        </Link>

        {/* 3. Center Action: Inquiry Basket (Thumb Zone Hero) */}
        <button
          type="button"
          onClick={handleOpenInquiry}
          className="relative flex flex-col items-center justify-center py-1 text-[#1B4332] hover:text-[#0F1A13] transition-transform active:scale-90 cursor-pointer"
          aria-label="View Inquiry Basket"
        >
          <div className="relative">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1B4332] text-white shadow-md">
              <ShoppingBag className="h-4 w-4" />
            </div>
            {totalPairs > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[9px] font-extrabold text-[#0F1A13] ring-2 ring-white">
                {totalPairs > 99 ? "99+" : totalPairs}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 text-[#1B4332] tracking-tight">Basket</span>
        </button>

        {/* 4. Tracking */}
        <Link
          to="/tracking"
          search={{ order: undefined }}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            isTracking ? "text-[#1B4332] font-bold" : "text-[#5C6B5A] hover:text-[#0F1A13]"
          }`}
          aria-label="Bilti Cargo Tracking"
        >
          <Truck className={`h-5 w-5 ${isTracking ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Tracking</span>
        </Link>

        {/* 5. Account */}
        <button
          type="button"
          onClick={handleOpenAuth}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            isAccount ? "text-[#1B4332] font-bold" : "text-[#5C6B5A] hover:text-[#0F1A13]"
          }`}
          aria-label="Buyer Account"
        >
          <div className="relative">
            <User className={`h-5 w-5 ${isAccount ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            {isAuthenticated && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isAuthenticated ? "Account" : "Sign In"}
          </span>
        </button>
      </div>
    </nav>
  );
}
