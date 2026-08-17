import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Package, ArrowRight } from "lucide-react";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex w-64 items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        <span>Search products...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Mobile search button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a product name, SKU, or category..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading={search.trim() ? "Results" : "Trending Products"}>
            {(search.trim()
              ? PRODUCTS.filter(
                  (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.sku.toLowerCase().includes(search.toLowerCase()) ||
                    p.categorySlug.toLowerCase().includes(search.toLowerCase()),
                ).slice(0, 6)
              : PRODUCTS.filter((p) => p.trending).slice(0, 3)
            ).map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.name} ${p.sku} ${p.categorySlug} ${search}`}
                onSelect={() => runCommand(() => navigate({ to: `/products/${p.slug}` }))}
                className="flex items-center gap-3 py-3"
              >
                <img src={p.image} alt={p.name} className="h-8 w-8 rounded-sm object-cover" />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.sku} • {p.priceLabel}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Categories">
            {(search.trim()
              ? CATEGORIES.filter(
                  (c) =>
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.slug.toLowerCase().includes(search.toLowerCase()) ||
                    c.gender.toLowerCase().includes(search.toLowerCase()),
                ).slice(0, 6)
              : CATEGORIES.slice(0, 6)
            ).map((c) => (
              <CommandItem
                key={c.slug}
                value={`category ${c.name} ${c.slug} ${c.gender} ${search}`}
                onSelect={() =>
                  runCommand(() =>
                    navigate({ to: "/products", search: { category: c.slug, gender: undefined } }),
                  )
                }
                className="flex items-center gap-3 py-2"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted">
                  <Package className="h-3 w-3" />
                </div>
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {c.productCount} items
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => runCommand(() => navigate({ to: "/bulk-order" }))}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Request Bulk Quote
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate({ to: "/manufacturing" }))}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Tour the Factory
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
