import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useWishlist } from "@/hooks/use-wishlist";
import { useInquiryBasket } from "@/hooks/use-inquiry-basket";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import { InquiryDrawer } from "@/components/inquiry-drawer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Heart,
  Clock,
  LogOut,
  Settings,
  Bell,
  LayoutDashboard,
  Grid,
  Search,
} from "lucide-react";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/dashboard/buyer")({
  loader: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/auth" });
    }
    const role =
      session.user?.user_metadata?.role || session.user?.user_metadata?.accountType || "BUYER";
    if (role && role !== "BUYER" && role !== "buyer" && role !== "ADMIN") {
      throw redirect({ to: "/dashboard/supplier" });
    }
    return { session };
  },
  component: BuyerDashboard,
});

function BuyerDashboard() {
  const { session } = Route.useLoaderData();
  const userMetadata = session?.user?.user_metadata || {};

  const { products } = useProducts();
  const { items: wishlistItems } = useWishlist();
  const { count: inquiryCount } = useInquiryBasket();
  const { products: recentProducts } = useRecentlyViewed(products);

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");

  const wishlistedProducts = products.filter((p) => wishlistItems.some((w) => w.slug === p.slug));

  const filteredCatalog = products.filter((p) => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.categorySlug.toLowerCase().includes(q)
    );
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <SiteLayout>
      <div className="bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">
                Welcome back, {userMetadata.full_name || "Buyer"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {userMetadata.company || "Wholesale Partner"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInquiryOpen(true)}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-emerald-deep transition cursor-pointer"
              >
                <Package className="h-4 w-4" />
                Active Inquiry ({inquiryCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                {
                  id: "catalog",
                  label: "Wholesale Catalog",
                  icon: Grid,
                  badge: products.length,
                },
                {
                  id: "wishlist",
                  label: "Saved for Later",
                  icon: Heart,
                  badge: wishlistItems.length,
                },
                { id: "history", label: "Browsing History", icon: Clock },
                { id: "settings", label: "Account Settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        activeTab === item.id
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              <div className="hidden md:block h-px bg-border my-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Items in Inquiry
                    </div>
                    <div className="text-3xl font-bold text-foreground">{inquiryCount}</div>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="text-xs text-primary font-medium hover:underline mt-2 cursor-pointer"
                    >
                      View current draft
                    </button>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Saved Items
                    </div>
                    <div className="text-3xl font-bold text-foreground">{wishlistItems.length}</div>
                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className="text-xs text-primary font-medium hover:underline mt-2 cursor-pointer"
                    >
                      View wishlist
                    </button>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Available Models
                    </div>
                    <div className="text-3xl font-bold text-foreground">{products.length}</div>
                    <button
                      onClick={() => setActiveTab("catalog")}
                      className="text-xs text-primary font-medium hover:underline mt-2 cursor-pointer"
                    >
                      Browse wholesale catalog
                    </button>
                  </div>
                </div>

                {/* Featured Catalog Products */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-display font-bold">
                        Wholesale Products & New Listings
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Direct factory rates, MOQ starting at 12 pairs (1 carton)
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("catalog")}
                      className="text-xs text-primary font-bold hover:underline cursor-pointer"
                    >
                      View All ({products.length}) →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.slice(0, 8).map((p, i) => (
                      <ProductCard
                        key={p.slug}
                        product={p}
                        index={i}
                        onQuickView={(prod) => setQuickViewProduct(prod)}
                      />
                    ))}
                  </div>
                </div>

                {recentProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-bold">Recently Viewed</h2>
                      <button
                        onClick={() => setActiveTab("history")}
                        className="text-sm text-primary font-medium hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {recentProducts.slice(0, 4).map((p, i) => (
                        <ProductCard
                          key={p.slug}
                          product={p}
                          index={i}
                          onQuickView={(prod) => setQuickViewProduct(prod)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FULL WHOLESALE CATALOG TAB */}
            {activeTab === "catalog" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold">Wholesale Catalog</h2>
                    <p className="text-xs text-muted-foreground">
                      Explore all footwear models available for bulk factory orders
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search shoes by name, SKU..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCatalog.map((p, i) => (
                    <ProductCard
                      key={p.slug}
                      product={p}
                      index={i}
                      onQuickView={(prod) => setQuickViewProduct(prod)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Saved for Later</h2>
                {wishlistedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlistedProducts.map((p, i) => (
                      <ProductCard key={p.slug} product={p} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-xl border border-border border-dashed bg-card/50">
                    <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">Your wishlist is empty</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      Save products you're interested in to review later.
                    </p>
                    <Link
                      to="/products"
                      search={{ category: undefined, gender: undefined }}
                      className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-emerald-deep"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Browsing History</h2>
                {recentProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentProducts.map((p, i) => (
                      <ProductCard key={p.slug} product={p} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-xl border border-border border-dashed bg-card/50">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No history yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      Products you view will appear here.
                    </p>
                    <Link
                      to="/products"
                      search={{ category: undefined, gender: undefined }}
                      className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-emerald-deep"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-xl">
                <h2 className="text-2xl font-display font-bold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Business Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Company Name
                        </label>
                        <div className="mt-1 font-medium">
                          {userMetadata.company || "Not provided"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Contact Name
                        </label>
                        <div className="mt-1 font-medium">
                          {userMetadata.full_name || "Not provided"}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Email
                        </label>
                        <div className="mt-1 font-medium">{session?.user?.email}</div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Phone Number
                        </label>
                        <div className="mt-1 font-medium">
                          {userMetadata.phone || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-3 mb-2 text-amber-600">
                      <Bell className="h-5 w-5" />
                      <h3 className="font-semibold">Notification Preferences</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Notification settings are currently managed via your account manager. Please
                      contact support to update preferences.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <InquiryDrawer isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </SiteLayout>
  );
}
