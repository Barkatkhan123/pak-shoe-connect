import { useState, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";
import { useAuth } from "./use-auth";

export type WishlistItem = {
  slug: string;
  name: string;
  image: string;
  priceLabel: string;
  sku: string;
};

const STORAGE_KEY = "shersha_wishlist";

function load(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("shersha_wishlist_update"));
}

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setItems(load());
    const handleUpdate = () => setItems(load());
    window.addEventListener("shersha_wishlist_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("shersha_wishlist_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      if (!isAuthenticated) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("shersha:open-auth-modal", {
              detail: {
                title: "Sign in to your Wishlist",
                description:
                  "Sign in or create your wholesale account to save bookmarked products across your devices.",
              },
            }),
          );
        }
        return;
      }

      const current = load();
      if (current.some((i) => i.slug === product.slug)) return;
      const next = [
        ...current,
        {
          slug: product.slug,
          name: product.name,
          image: product.image,
          priceLabel: product.priceLabel,
          sku: product.sku,
        },
      ];
      save(next);
      setItems(next);
    },
    [isAuthenticated],
  );

  const removeItem = useCallback((slug: string) => {
    const current = load();
    const next = current.filter((i) => i.slug !== slug);
    save(next);
    setItems(next);
  }, []);

  const toggleItem = useCallback(
    (product: Product) => {
      if (!isAuthenticated) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("shersha:open-auth-modal", {
              detail: {
                title: "Sign in to your Wishlist",
                description:
                  "Sign in or create your wholesale account to save and manage your bookmarked footwear designs.",
              },
            }),
          );
        }
        return;
      }

      const current = load();
      const exists = current.some((i) => i.slug === product.slug);
      if (exists) {
        const next = current.filter((i) => i.slug !== product.slug);
        save(next);
        setItems(next);
      } else {
        const next = [
          ...current,
          {
            slug: product.slug,
            name: product.name,
            image: product.image,
            priceLabel: product.priceLabel,
            sku: product.sku,
          },
        ];
        save(next);
        setItems(next);
      }
    },
    [isAuthenticated],
  );

  const isInWishlist = useCallback(
    (slug: string) => {
      return items.some((i) => i.slug === slug);
    },
    [items],
  );

  const clearWishlist = useCallback(() => {
    save([]);
    setItems([]);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    isWishlisted: isInWishlist,
    clearWishlist,
    clear: clearWishlist,
    count: isMounted ? items.length : 0,
  };
}
