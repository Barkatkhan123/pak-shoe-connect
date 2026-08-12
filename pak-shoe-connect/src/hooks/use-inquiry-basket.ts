import { useState, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";

export type InquiryItem = {
  slug: string;
  name: string;
  sku: string;
  image: string;
  moq: number;
  requestedQty: number;
  color: string;
  size: string;
  priceLabel: string;
  price: number;
};

const STORAGE_KEY = "shersha_inquiry_basket";

function load(): InquiryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: InquiryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Broadcast to all other hook instances on this page
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function useInquiryBasket() {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(load());
    setIsMounted(true);
  }, []);

  // Sync across hook instances on this page via storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setItems(load());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist to localStorage whenever items change (after mount)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addItem = useCallback(
    (product: Product, options?: { color?: string; size?: string; qty?: number }) => {
      const unitPrice = product.priceTiers?.[0]?.pricePerPair ?? 1000;
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === product.slug);
        let next: InquiryItem[];
        if (existing) {
          next = prev.map((i) =>
            i.slug === product.slug
              ? { ...i, requestedQty: i.requestedQty + (options?.qty ?? product.moq) }
              : i
          );
        } else {
          next = [
            ...prev,
            {
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              image: product.image,
              moq: product.moq || 12,
              requestedQty: options?.qty ?? product.moq ?? 12,
              color: options?.color ?? product.colors?.[0] ?? "",
              size: options?.size ?? product.sizes?.[0] ?? "",
              priceLabel: product.priceLabel ?? `PKR ${unitPrice}`,
              price: unitPrice,
            },
          ];
        }
        // Immediately broadcast the new state to all hook instances
        save(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.slug !== slug);
      save(next);
      return next;
    });
  }, []);

  const updateQty = useCallback((slug: string, qty: number) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.slug === slug ? { ...i, requestedQty: qty } : i));
      save(next);
      return next;
    });
  }, []);

  const isInBasket = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const clear = useCallback(() => {
    setItems([]);
    save([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.requestedQty, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQty,
    isInBasket,
    clear,
    clearBasket: clear,
    count: items.length,
    totalItems,
  };
}
