import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import { useState, useMemo, useEffect } from "react";
import { X, Search, ChevronDown, Package, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/data/products";

const productsSearchSchema = z.object({
  category: z.string().optional(),
  gender: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: (search) => productsSearchSchema.parse(search),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Wholesale Footwear Catalog — Direct Factory Rates | Anamon" },
      {
        name: "description",
        content:
          "Browse Anamon's complete wholesale footwear catalogue. Men's peshawari, formal, casual, women's heels & flats, kids school shoes. Bulk orders & private label.",
      },
    ],
  }),
});

function ProductsPage() {
  const searchParams = Route.useSearch();
  const category = searchParams?.category;
  const gender = searchParams?.gender;
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Mobile filter bottom sheet
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFilters(false);
    };
    if (showFilters) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showFilters]);
  
  // Filter state initialized from URL params
  const [selectedCats, setSelectedCats] = useState<string[]>(() => (category ? [category] : []));
  const [selectedGender, setSelectedGender] = useState<string | null>(() => gender || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest"); // "newest", "price-low", "price-high", "moq-low"

  // Sync URL search params into filter state on direct URL navigation
  useEffect(() => {
    if (category) {
      setSelectedCats([category]);
    } else {
      setSelectedCats([]);
    }
  }, [category]);

  useEffect(() => {
    setSelectedGender(gender || null);
  }, [gender]);

  // Filtered & Sorted Products with resilient optional chaining
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;

    if (selectedCats.length > 0) {
      result = result.filter((p) => selectedCats.includes(p.categorySlug));
    }
    
    if (selectedGender && selectedGender !== "all") {
      result = result.filter((p) => p.gender === selectedGender);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort safely
    return [...result].sort((a, b) => {
      const aMinPrice = a.priceTiers?.[a.priceTiers.length - 1]?.pricePerPair || 0;
      const bMinPrice = b.priceTiers?.[b.priceTiers.length - 1]?.pricePerPair || 0;
      const aMaxPrice = a.priceTiers?.[0]?.pricePerPair || 0;
      const bMaxPrice = b.priceTiers?.[0]?.pricePerPair || 0;
      const aMoq = a.moq || 0;
      const bMoq = b.moq || 0;

      switch (sort) {
        case "price-low":
          return aMinPrice - bMinPrice;
        case "price-high":
          return bMaxPrice - aMaxPrice;
        case "moq-low":
          return aMoq - bMoq;
        case "newest":
        default:
          return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      }
    });
  }, [selectedCats, selectedGender, searchQuery, sort]);

  const toggleCategory = (slug: string) => {
    setSelectedCats((prev) => 
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearAllFilters = () => {
    setSelectedCats([]);
    setSelectedGender(null);
    setSearchQuery("");
    setSort("newest");
  };

  const activeFiltersCount = (selectedCats.length > 0 ? selectedCats.length : 0) + (selectedGender ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <SiteLayout>
      {/* ── Compact Header & Breadcrumbs (Replaces bulky full-bleed hero) ── */}
      <div className="bg-white border-b border-[#E0D9CE] py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#0F1A13] font-bold">Wholesale Catalog</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F1A13]">
                Wholesale Footwear Catalog
              </h1>
              <p className="text-xs sm:text-sm text-[#5C6B5A] mt-0.5">
                Factory-direct pricing, 12-pair low MOQs (multiples of 12), and reliable 3–5 day dispatch nationwide.
              </p>
            </div>
            <div className="text-xs font-bold text-[#8B5E3C] bg-[#FAF7F2] border border-[#E0D9CE] px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
              Showing {filteredProducts.length} of {PRODUCTS.length} Models
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Mobile / Desktop Filter & Sort Bar ── */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white/95 backdrop-blur-md border-b border-[#E0D9CE] py-2.5 shadow-xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Mobile Filters Toggle Button */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center justify-center gap-1.5 rounded-lg border border-[#E0D9CE] bg-[#FAF7F2] px-3 py-2 text-xs font-bold text-[#0F1A13] hover:bg-black/5 transition-all w-full sm:w-auto cursor-pointer"
                aria-label="Open filter options"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#1B4332]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="grid h-4 min-w-[16px] px-1 place-items-center rounded-full bg-[#1B4332] text-[9px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Search Bar */}
              <div className="relative hidden sm:block w-48 lg:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search models, SKUs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#E0D9CE] bg-[#FAF7F2] pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            {/* Right: Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-lg border border-[#E0D9CE] bg-[#FAF7F2] pl-3 pr-7 py-2 text-xs font-bold text-[#0F1A13] outline-none cursor-pointer hover:bg-white transition-colors"
                  aria-label="Sort product catalog"
                >
                  <option value="newest">Sort: Newest Arrival</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="moq-low">MOQ: Lowest First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="mt-2 pt-2 border-t border-[#E0D9CE]/50 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Active:
              </span>
              {selectedGender && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold capitalize">
                  {selectedGender}
                  <button onClick={() => setSelectedGender(null)} className="hover:text-rose-500 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCats.map((slug) => {
                const catObj = CATEGORIES.find((c) => c.slug === slug);
                return (
                  <span key={slug} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold">
                    {catObj?.name || slug}
                    <button onClick={() => toggleCategory(slug)} className="hover:text-rose-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332] text-xs font-bold">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-rose-500 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Main Catalog Grid & Desktop Sidebar ── */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 space-y-6">
            <div className="sticky top-32 space-y-6">
              
              {/* Gender Radio Group */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] mb-3">
                  Gender
                </h3>
                <div className="space-y-1.5">
                  {["all", "men", "women", "kids", "unisex"].map((g) => (
                    <label key={g} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer group hover:text-primary">
                      <input
                        type="radio"
                        name="desktop-gender"
                        checked={g === "all" ? selectedGender === null : selectedGender === g}
                        onChange={() => setSelectedGender(g === "all" ? null : g)}
                        className="h-3.5 w-3.5 text-primary focus:ring-primary"
                      />
                      <span className="capitalize">{g === "all" ? "All Footwear" : g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Checkbox List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] mb-3">
                  Wholesale Categories
                </h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 scrollbar-hide">
                  {CATEGORIES.map((c) => (
                    <label key={c.slug} className="flex items-center justify-between gap-2 text-xs font-semibold cursor-pointer group hover:text-primary">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(c.slug)}
                          onChange={() => toggleCategory(c.slug)}
                          className="h-3.5 w-3.5 rounded text-primary focus:ring-primary"
                        />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-[#FAF7F2] border border-[#E0D9CE] px-1.5 py-0.2 rounded font-bold">
                        {c.productCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Action */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 rounded-lg border border-[#E0D9CE] bg-white text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}

            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {filteredProducts.map((p, i) => (
                  <ProductCard
                    key={p.slug}
                    product={p}
                    index={i}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-[#E0D9CE] p-6">
                <Package className="h-12 w-12 text-[#8B5E3C] opacity-40 mb-3" />
                <h3 className="font-display text-lg font-bold text-[#0F1A13]">No matching footwear found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Try adjusting your category or gender filter criteria, or search for other model names.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-5 py-2.5 rounded-lg bg-[#1B4332] text-white text-xs font-bold hover:bg-[#C9A84C] hover:text-[#0F1A13] transition shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E0D9CE] px-4 py-4">
              <h2 className="font-display text-base font-bold text-[#0F1A13]">Filter Catalog</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-[#0F1A13]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Gender */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] mb-3">
                  Gender Collection
                </h3>
                <div className="space-y-2">
                  {["all", "men", "women", "kids", "unisex"].map((g) => (
                    <label key={g} className="flex items-center gap-3 text-sm font-semibold capitalize cursor-pointer">
                      <input
                        type="radio"
                        name="mobile-gender"
                        checked={g === "all" ? selectedGender === null : selectedGender === g}
                        onChange={() => setSelectedGender(g === "all" ? null : g)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span>{g === "all" ? "All Footwear" : g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] mb-3">
                  Footwear Categories
                </h3>
                <div className="space-y-2.5">
                  {CATEGORIES.map((c) => (
                    <label key={c.slug} className="flex items-center justify-between text-sm font-semibold cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(c.slug)}
                          onChange={() => toggleCategory(c.slug)}
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                        />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-[#FAF7F2] border border-[#E0D9CE] px-1.5 py-0.2 rounded font-bold">
                        {c.productCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E0D9CE] p-4 bg-[#FAF7F2] flex items-center gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-lg border border-[#E0D9CE] bg-white text-xs font-bold text-[#0F1A13] hover:bg-black/5 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#1B4332] text-white text-xs font-bold shadow-sm hover:bg-[#C9A84C] hover:text-[#0F1A13] transition cursor-pointer"
              >
                Show ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </SiteLayout>
  );
}
