import { useEffect, useState, useCallback } from "react";
import type { Product } from "@/data/products";

const STORAGE_KEY = "shersha_recently_viewed";
const MAX_ITEMS = 8;

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useRecentlyViewed(allProducts: Product[]) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSlugs(load());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    }
  }, [slugs, isLoaded]);

  const addViewed = useCallback((slug: string) => {
    setSlugs((prev) => {
      const filtered = prev.filter((s) => s !== slug);
      return [slug, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const products = slugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];

  return { products, addViewed };
}
