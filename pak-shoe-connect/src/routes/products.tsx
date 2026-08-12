import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-layout";
import { PRODUCTS, CATEGORIES, type Category } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { QuickViewModal } from "@/components/quick-view-modal";
import { useState, useMemo, useEffect } from "react";
import { Filter, X, Search, ChevronDown, Package } from "lucide-react";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: search.category as string | undefined,
      gender: search.gender as string | undefined,
    };
  },
});

function ProductsPage() {
  const { category, gender } = Route.useSearch();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Mobile filter drawer
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFilters(false);
    };
    if (showFilters) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showFilters]);
  
  // Filter state
  const [selectedCats, setSelectedCats] = useState<string[]>(category ? [category] : []);
  const [selectedGender, setSelectedGender] = useState<string | null>(gender || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest"); // "newest", "price-low", "price-high", "moq-low"
  const navigate = useNavigate();

  // Sync URL search params to local filter state when URL changes
  useEffect(() => {
    setSelectedCats(category ? [category] : []);
  }, [category]);

  useEffect(() => {
    setSelectedGender(gender || null);
  }, [gender]);

  // Sync filter state changes back to URL
  useEffect(() => {
    const targetCat = selectedCats.length === 1 ? selectedCats[0] : undefined;
    const targetGender = selectedGender || undefined;
    if (targetCat !== category || targetGender !== gender) {
      navigate({
        to: '/products',
        search: {
          category: targetCat,
          gender: targetGender,
        },
        replace: true,
      });
    }
  }, [selectedCats, selectedGender, category, gender]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS;

    if (selectedCats.length > 0) {
      result = result.filter(p => selectedCats.includes(p.categorySlug));
    }
    
    if (selectedGender) {
      result = result.filter(p => p.gender === selectedGender);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (sort) {
        case "price-low":
          return a.priceTiers[a.priceTiers.length - 1].pricePerPair - b.priceTiers[b.priceTiers.length - 1].pricePerPair;
        case "price-high":
          return b.priceTiers[0].pricePerPair - a.priceTiers[0].pricePerPair;
        case "moq-low":
          return a.moq - b.moq;
        case "newest":
        default:
          return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      }
    });
  }, [selectedCats, selectedGender, searchQuery, sort]);

  const toggleCategory = (slug: string) => {
    setSelectedCats(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const activeCategoryObj = category ? CATEGORIES.find(c => c.slug === category) : null;
  const heroTitle = activeCategoryObj 
    ? activeCategoryObj.name 
    : gender 
      ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Collection`
      : "Wholesale Catalog";
  
  const heroDesc = activeCategoryObj 
    ? activeCategoryObj.description 
    : "Browse our complete catalog of factory-direct footwear. Minimum order quantities apply.";

  return (
    <SiteLayout>
      <PageHero 
        title={heroTitle} 
        description={heroDesc} 
        eyebrow="B2B Marketplace" 
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-64 shrink-0 space-y-8">
            <div className="sticky top-24">
              {/* Search */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Gender Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Gender</h3>
                <div className="space-y-2">
                  {["all", "men", "women", "kids", "unisex"].map(g => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={g === "all" ? selectedGender === null : selectedGender === g}
                        onChange={() => setSelectedGender(g === "all" ? null : g)}
                        className="h-4 w-4 rounded-full border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors capitalize">
                        {g}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {CATEGORIES.filter(c => !selectedGender || c.gender === selectedGender || c.gender === "unisex").map(c => (
                    <label key={c.slug} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedCats.includes(c.slug)}
                        onChange={() => toggleCategory(c.slug)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors flex-1">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {c.productCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {(selectedCats.length > 0 || selectedGender || searchQuery) && (
                <button 
                  onClick={() => {
                    setSelectedCats([]);
                    setSelectedGender(null);
                    setSearchQuery("");
                    setSort("newest");
                  }}
                  className="mt-6 w-full rounded-md border border-border py-2 text-xs font-semibold hover:bg-muted"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">{filteredProducts.length}</span> products
              </p>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm"
                >
                  <Filter className="h-4 w-4" /> Filters
                  {(selectedCats.length > 0 || selectedGender) && (
                    <span className="ml-1 rounded-full bg-primary h-2 w-2" />
                  )}
                </button>
                
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full sm:w-48 appearance-none rounded-md border border-border bg-card px-4 py-2.5 pr-8 text-sm font-medium shadow-sm outline-none focus:border-primary"
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="moq-low">MOQ: Low to High</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border border-dashed">
                <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No products found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  We couldn't find any products matching your current filters. Try removing some filters or searching for something else.
                </p>
                <button 
                  onClick={() => { setSelectedCats([]); setSelectedGender(null); setSearchQuery(""); setSort("newest"); }}
                  className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-emerald-deep"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {/* Gender Filter Mobile */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Gender</h3>
                <div className="space-y-3">
                  {["all", "men", "women", "kids", "unisex"].map(g => (
                    <label key={g} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="gender-mobile" 
                        checked={g === "all" ? selectedGender === null : selectedGender === g}
                        onChange={() => setSelectedGender(g === "all" ? null : g)}
                        className="h-5 w-5 rounded-full border-border text-primary focus:ring-primary"
                      />
                      <span className="text-base font-medium capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories Filter Mobile */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
                <div className="space-y-4">
                  {CATEGORIES.filter(c => !selectedGender || c.gender === selectedGender || c.gender === "unisex").map(c => (
                    <label key={c.slug} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedCats.includes(c.slug)}
                        onChange={() => toggleCategory(c.slug)}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-base font-medium flex-1">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.productCount}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-border p-4 bg-muted/30">
              <div className="flex gap-3">
                <button 
                  onClick={() => { setSelectedCats([]); setSelectedGender(null); setSort("newest"); }}
                  className="flex-1 rounded-md border border-border py-3 text-sm font-semibold bg-background hover:bg-muted"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="flex-1 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md"
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </SiteLayout>
  );
}
