import { useState, useCallback, useEffect, useRef } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { type Product, PRODUCTS } from "@/data/products";
import { useAuth } from "./use-auth";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export type InquiryItem = {
  slug: string;
  name: string;
  sku: string;
  image: string;
  moq: number;
  cartonQty?: number;
  requestedQty: number;
  cartonCount?: number;
  color: string;
  size: string;
  priceLabel: string;
  price: number;
  tierName?: string;
};

export interface PendingBasketAction {
  version: 1;
  type: "ADD_TO_BASKET";
  createdAt: number;
  expiresAt: number; // TTL: 60 minutes
  idempotencyKey: string;
  productId?: string;
  slug: string;
  name: string;
  sku: string;
  image: string;
  moq: number;
  cartonQty: number;
  requestedQty: number;
  cartonCount: number;
  color: string;
  size: string;
  priceLabel: string;
  price: number;
  tierName?: string;
}

const STORAGE_KEY = "shersha_inquiry_basket";
const PENDING_ACTION_KEY = "shersha_pending_basket_action";
const PENDING_TTL_MS = 60 * 60 * 1000; // 60 minutes

// Module-level atomic restoration lock across hook instances
let isRestoringLock = false;

// ── Storage Helpers ────────────────────────────────────────────────────────

function loadLocalBasket(): InquiryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocalBasket(items: InquiryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function savePendingAction(action: Omit<PendingBasketAction, "version" | "type" | "createdAt" | "expiresAt" | "idempotencyKey"> & { idempotencyKey?: string }): PendingBasketAction {
  const now = Date.now();
  const fullAction: PendingBasketAction = {
    ...action,
    version: 1,
    type: "ADD_TO_BASKET",
    createdAt: now,
    expiresAt: now + PENDING_TTL_MS,
    idempotencyKey: action.idempotencyKey || `pending_${now}_${Math.random().toString(36).slice(2, 9)}`,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(fullAction));
    window.dispatchEvent(new CustomEvent("shersha:pending-action-updated"));
  }
  return fullAction;
}

export function getPendingAction(): PendingBasketAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_ACTION_KEY);
    if (!raw) return null;
    const parsed: PendingBasketAction = JSON.parse(raw);
    
    // Safeguard 1: Validate Version & Expiration (TTL: 60 mins)
    if (parsed.version !== 1 || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(PENDING_ACTION_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(PENDING_ACTION_KEY);
    return null;
  }
}

export function clearPendingAction(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PENDING_ACTION_KEY);
    window.dispatchEvent(new CustomEvent("shersha:pending-action-updated"));
  }
}

// ── Main Unified Hook ──────────────────────────────────────────────────────

export function useInquiryBasket() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<InquiryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isMountedRef = useRef(false);

  const queryKey = ["basket", user?.id || "anonymous"];

  // 1. TanStack Query for authenticated basket sync
  const { data: serverBasket, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        return { items: loadLocalBasket(), totalPairs: 0, totalCartons: 0, subtotal: 0 };
      }
      const res = await apiClient.basket.get();
      if (res.success && res.data) {
        const items: InquiryItem[] = (res.data.items || []).map((i: any) => ({
          slug: i.slug,
          name: i.name,
          sku: i.sku,
          image: i.image,
          moq: i.moq || 12,
          cartonQty: i.cartonQty || 12,
          requestedQty: i.requestedQty || 12,
          cartonCount: i.cartonCount || 1,
          color: i.color || "Standard",
          size: i.size || "Assorted",
          priceLabel: i.priceLabel || `PKR ${i.unitPrice?.toLocaleString() || 1000}/pair`,
          price: i.unitPrice || 1000,
          tierName: i.tierName,
        }));
        saveLocalBasket(items);
        return { items, totalPairs: res.data.totalPairs, totalCartons: res.data.totalCartons, subtotal: res.data.subtotal };
      }
      return { items: loadLocalBasket(), totalPairs: 0, totalCartons: 0, subtotal: 0 };
    },
    enabled: isAuthenticated && !authLoading,
    staleTime: 1000 * 30, // 30s
  });

  // Effective items (guarantee SSR hydration match)
  const items: InquiryItem[] = mounted
    ? (isAuthenticated && serverBasket?.items ? serverBasket.items : localItems)
    : [];

  // Sync across tabs/instances via storage events
  useEffect(() => {
    isMountedRef.current = true;
    setMounted(true);
    setLocalItems(loadLocalBasket());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setLocalItems(loadLocalBasket());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // 2. TanStack Mutation for adding to basket
  const addMutation = useMutation({
    mutationFn: async (payload: {
      product: Product;
      options?: { color?: string; size?: string; qty?: number; cartonCount?: number; tierName?: string };
      idempotencyKey?: string;
    }) => {
      const { product, options, idempotencyKey } = payload;
      const requestedQty = options?.qty ?? product.moq ?? 12;
      const cartonQty = product.cartonQty || 12;
      const cartonCount = options?.cartonCount ?? Math.max(1, Math.ceil(requestedQty / cartonQty));
      const color = options?.color ?? product.colors?.[0] ?? "Standard";
      const size = options?.size ?? product.sizes?.[0] ?? "Assorted";

      // Server-side API call with session verification & pricing recalculation
      const res = await apiClient.basket.addItem({
        productSlug: product.slug,
        quantityPairs: requestedQty,
        cartonCount,
        color,
        size,
        idempotencyKey,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to add item to server basket");
      }

      return { product, options, responseData: res.data };
    },
    onSuccess: (data) => {
      // Invalidate TanStack Query Cache
      queryClient.invalidateQueries({ queryKey });

      // Update local storage backup
      const { product, options } = data;
      const requestedQty = options?.qty ?? product.moq ?? 12;
      const color = options?.color ?? product.colors?.[0] ?? "Standard";
      const size = options?.size ?? product.sizes?.[0] ?? "Assorted";
      const unitPrice = product.priceTiers?.[0]?.pricePerPair ?? 1000;

      const current = loadLocalBasket();
      const existing = current.find((i) => i.slug === product.slug && i.color === color && i.size === size);
      let updated: InquiryItem[];
      if (existing) {
        updated = current.map((i) =>
          i === existing ? { ...i, requestedQty: i.requestedQty + requestedQty } : i
        );
      } else {
        updated = [
          ...current,
          {
            slug: product.slug,
            name: product.name,
            sku: product.sku,
            image: product.image,
            moq: product.moq || 12,
            cartonQty: product.cartonQty || 12,
            requestedQty,
            cartonCount: options?.cartonCount ?? Math.max(1, Math.ceil(requestedQty / (product.cartonQty || 12))),
            color,
            size,
            priceLabel: product.priceLabel ?? `PKR ${unitPrice}/pair`,
            price: unitPrice,
          },
        ];
      }
      saveLocalBasket(updated);
      setLocalItems(updated);

      // Safeguard 3: Only clear pending action on confirmed success
      clearPendingAction();

      // Open Inquiry Drawer
      window.dispatchEvent(new CustomEvent("shersha:open-inquiry-drawer"));
    },
    onError: (error: any) => {
      toast.error(error.message || "Could not add item to basket. Please try again.");
    },
  });

  // 3. User-facing addItem handler (Enforces Authentication Check)
  const addItem = useCallback(
    async (product: Product, options?: { color?: string; size?: string; qty?: number; cartonCount?: number; tierName?: string }) => {
      // Prevent double-click creation
      if (isAdding || addMutation.isPending) return;

      const requestedQty = options?.qty ?? product.moq ?? 12;
      const cartonQty = product.cartonQty || 12;
      const cartonCount = options?.cartonCount ?? Math.max(1, Math.ceil(requestedQty / cartonQty));
      const color = options?.color ?? product.colors?.[0] ?? "Standard";
      const size = options?.size ?? product.sizes?.[0] ?? "Assorted";
      const unitPrice = product.priceTiers?.[0]?.pricePerPair ?? 1000;

      // ── AUTHENTICATION / GUEST BASKET HANDLER ────────────────────────
      if (!isAuthenticated || !user) {
        // 1. Save full versioned pending action with 60m TTL
        savePendingAction({
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          image: product.image,
          moq: product.moq || 12,
          cartonQty,
          requestedQty,
          cartonCount,
          color,
          size,
          priceLabel: product.priceLabel ?? `PKR ${unitPrice}/pair`,
          price: unitPrice,
          tierName: options?.tierName,
        });

        // 2. Add to local guest basket so product shows up immediately in the cart
        const current = loadLocalBasket();
        const existing = current.find((i) => i.slug === product.slug && i.color === color && i.size === size);
        let updated: InquiryItem[];
        if (existing) {
          updated = current.map((i) =>
            i === existing ? { ...i, requestedQty: i.requestedQty + requestedQty } : i
          );
        } else {
          updated = [
            ...current,
            {
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              image: product.image,
              moq: product.moq || 12,
              cartonQty,
              requestedQty,
              cartonCount,
              color,
              size,
              priceLabel: product.priceLabel ?? `PKR ${unitPrice}/pair`,
              price: unitPrice,
              tierName: options?.tierName,
            },
          ];
        }
        saveLocalBasket(updated);
        setLocalItems(updated);

        // 3. Trigger sign in modal popup with pending selection preserved
        toast.info("Please sign in to add items to your Inquiry Basket.", {
          description: `Saved selection: ${requestedQty} pairs of ${product.name} (${color}, ${size}).`,
        });

        window.dispatchEvent(
          new CustomEvent("shersha:open-auth-modal", {
            detail: {
              hasPendingItem: true,
              productSlug: product.slug,
              title: "Sign in to your Basket",
              description: "Sign in or create your wholesale buyer account to add items to your inquiry basket and request factory bulk quotes.",
            },
          })
        );
        return;
      }

      // ── AUTHENTICATED ADD TO BASKET ───────────────────────────────────
      setIsAdding(true);
      try {
        await addMutation.mutateAsync({ product, options });
        toast.success(`Added ${requestedQty} pairs of ${product.name} to Inquiry Basket!`, {
          description: `Color: ${color} • Size: ${size}`,
        });
      } finally {
        setIsAdding(false);
      }
    },
    [isAuthenticated, user, isAdding, addMutation]
  );

  // 4. Safeguard 2: Atomic Auto-Resumption on Auth State Change
  useEffect(() => {
    if (!isAuthenticated || !user || authLoading) return;

    const pending = getPendingAction();
    const guestItems = loadLocalBasket();
    if (!pending && guestItems.length === 0) return;

    // Mutex lock to prevent duplicate execution across re-renders
    if (isRestoringLock) return;
    isRestoringLock = true;

    const resumeAction = async () => {
      try {
        if (pending) {
          // Reconstruct or lookup product definition from catalog
          const catalogProduct = PRODUCTS.find((p) => p.slug === pending.slug);
          const resolvedProduct: Product = catalogProduct || ({
            slug: pending.slug,
            name: pending.name,
            sku: pending.sku,
            image: pending.image,
            images: [pending.image],
            moq: pending.moq,
            cartonQty: pending.cartonQty,
            nameUrdu: "",
            categorySlug: "",
            gender: "unisex",
            material: "Leather",
            soleType: "PU / Rubber",
            colorVariants: [],
            colors: [pending.color],
            sizes: [pending.size],
            priceLabel: pending.priceLabel,
            priceTiers: [{ moq: pending.moq, pricePerPair: pending.price, label: pending.tierName || "Standard Tier" }],
            description: "",
            newArrival: false,
            bestseller: false,
            featured: false,
            trending: false,
            inStock: true,
            leadTimeDays: "3-5 days",
            productionCapacity: "10,000 pairs/month",
            customization: [],
            specifications: {},
            reviews: [],
          } as unknown as Product);

          // Execute server mutation with idempotency key
          await addMutation.mutateAsync({
            product: resolvedProduct,
            options: {
              color: pending.color,
              size: pending.size,
              qty: pending.requestedQty,
              cartonCount: pending.cartonCount,
              tierName: pending.tierName,
            },
            idempotencyKey: pending.idempotencyKey,
          });

          toast.success(`Welcome back! Added ${pending.requestedQty} pairs of ${pending.name} to your basket.`, {
            description: `Color: ${pending.color} • Size: ${pending.size}`,
          });
        }
      } catch (err: any) {
        console.error("[useInquiryBasket] Auto-resumption error:", err);
        // Do NOT clear pending action on failure; user can retry
      } finally {
        isRestoringLock = false;
      }
    };

    resumeAction();
  }, [isAuthenticated, user, authLoading]);

  // 5. Remove Item mutation
  const removeItem = useCallback(
    async (slug: string, options?: { color?: string; size?: string }) => {
      if (isAuthenticated) {
        try {
          await apiClient.basket.removeItem(slug, options);
          queryClient.invalidateQueries({ queryKey });
        } catch {}
      }
      setLocalItems((prev) => {
        const next = prev.filter((i) => {
          if (i.slug !== slug) return true;
          if (options?.color && i.color !== options.color) return true;
          if (options?.size && i.size !== options.size) return true;
          return false;
        });
        saveLocalBasket(next);
        return next;
      });
    },
    [isAuthenticated, queryClient, queryKey]
  );

  // 6. Update Qty mutation
  const updateQty = useCallback(
    async (slug: string, qty: number) => {
      if (isAuthenticated) {
        try {
          await apiClient.basket.updateQty({ slug, quantity: qty });
          queryClient.invalidateQueries({ queryKey });
        } catch {}
      }
      setLocalItems((prev) => {
        const next = prev.map((i) => (i.slug === slug ? { ...i, requestedQty: qty } : i));
        saveLocalBasket(next);
        return next;
      });
    },
    [isAuthenticated, queryClient, queryKey]
  );

  // 7. Clear Basket mutation
  const clear = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await apiClient.basket.clear();
        queryClient.invalidateQueries({ queryKey });
      } catch {}
    }
    setLocalItems([]);
    saveLocalBasket([]);
  }, [isAuthenticated, queryClient, queryKey]);

  // 8. Helper checkers
  const isInBasket = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

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
    isAdding: isAdding || addMutation.isPending,
    isAuthenticated,
    hasPendingAction: !!getPendingAction(),
  };
}
