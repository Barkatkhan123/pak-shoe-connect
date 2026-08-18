import { describe, it, expect, beforeEach } from "vitest";

// Polyfill window and localStorage for node test runner
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
};

// @ts-expect-error global mock
globalThis.localStorage = mockLocalStorage;
// @ts-expect-error global mock
globalThis.window = {
  localStorage: mockLocalStorage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

import {
  getStoredProducts,
  saveStoredProducts,
  updateStoredProduct,
  addStoredProduct,
  deleteStoredProduct,
  resetStoredProducts,
  getProduct,
  DEFAULT_PRODUCTS,
} from "../src/data/products";

describe("Product Persistence & Admin Image Updates", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("should initialize with default products when storage is empty", () => {
    const products = getStoredProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].slug).toBe(DEFAULT_PRODUCTS[0].slug);
  });

  it("should update a product picture and reflect across getStoredProducts and getProduct", () => {
    const targetSlug = DEFAULT_PRODUCTS[0].slug;
    const newImageUrl = "https://images.unsplash.com/custom-new-shoe.jpg";
    const newGallery = [
      newImageUrl,
      "https://images.unsplash.com/angle-1.jpg",
      "https://images.unsplash.com/angle-2.jpg",
    ];

    updateStoredProduct(targetSlug, {
      image: newImageUrl,
      images: newGallery,
    });

    const updated = getProduct(targetSlug);
    expect(updated).toBeDefined();
    expect(updated?.image).toBe(newImageUrl);
    expect(updated?.images).toEqual(newGallery);
    expect(updated?.images[0]).toBe(newImageUrl);
  });

  it("should support adding a new product and retrieving it", () => {
    const newProduct = {
      ...DEFAULT_PRODUCTS[0],
      slug: "new-leather-boot-2026",
      sku: "SHR-BOOT-999",
      name: "New Handcrafted Leather Boot",
      image: "https://images.unsplash.com/boot.jpg",
      images: ["https://images.unsplash.com/boot.jpg"],
    };

    addStoredProduct(newProduct);

    const found = getProduct("new-leather-boot-2026");
    expect(found).toBeDefined();
    expect(found?.name).toBe("New Handcrafted Leather Boot");
    expect(found?.image).toBe("https://images.unsplash.com/boot.jpg");
  });

  it("should delete a product and remove it from store", () => {
    const targetSlug = DEFAULT_PRODUCTS[0].slug;
    deleteStoredProduct(targetSlug);

    const found = getProduct(targetSlug);
    expect(found).toBeUndefined();
  });

  it("should reset products to factory defaults", () => {
    const targetSlug = DEFAULT_PRODUCTS[0].slug;
    deleteStoredProduct(targetSlug);
    expect(getProduct(targetSlug)).toBeUndefined();

    resetStoredProducts();
    expect(getProduct(targetSlug)).toBeDefined();
  });

  it("should handle new products with undefined reviews or price tiers safely", () => {
    const edgeCaseProduct = {
      ...DEFAULT_PRODUCTS[0],
      slug: "edge-product-123",
      sku: "SHR-EDGE-123",
      name: "Edge Case Footwear",
      reviews: undefined as any,
      priceTiers: undefined as any,
      stats: undefined as any,
      newArrival: true,
      featured: true,
    };

    addStoredProduct(edgeCaseProduct as any);
    const found = getProduct("edge-case-product-123") || getProduct("edge-product-123");
    expect(found).toBeDefined();
    expect(found?.name).toBe("Edge Case Footwear");
  });
});
