import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  Product,
  getStoredProducts,
  saveStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  resetStoredProducts,
  getProduct,
  getCategoriesWithCounts,
  CATEGORIES,
} from "../src/data/products";
import { apiClient } from "../src/lib/api-client";
import { adminSecurityEngine, MASTER_ADMIN_EMAIL } from "../src/lib/admin-auth";

describe("Admin Panel CRUD & User-Facing Real-Time Synchronization Suite", () => {
  beforeEach(() => {
    // Reset stored products to factory state before each test
    resetStoredProducts();
    // Establish valid admin session
    adminSecurityEngine.createSession(MASTER_ADMIN_EMAIL, true);
  });

  afterEach(() => {
    resetStoredProducts();
    adminSecurityEngine.clearSession();
  });

  it("1. should successfully CREATE a new product from Admin and make it immediately visible to User Catalog", async () => {
    const initialCount = getStoredProducts().length;

    const newProduct: Product = {
      slug: "anm-royal-peshawari-999",
      sku: "ANM-RYL-999",
      name: "Royal Velvet Peshawari Handcrafted",
      nameUrdu: "شاہی پشاوری چپل",
      categorySlug: "men-peshawari",
      gender: "men",
      image: "https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800",
      images: ["https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800"],
      material: "Full-Grain Cowhide Leather",
      soleType: "Direct Injection TPU Sole",
      colorVariants: [
        { name: "Emerald Green", hex: "#064E3B", inStock: true, stockUnits: 500 },
        { name: "Royal Tan", hex: "#C4906B", inStock: true, stockUnits: 400 },
      ],
      colors: ["Emerald Green", "Royal Tan"],
      sizes: ["6", "7", "8", "9", "10", "11", "12"],
      moq: 12,
      cartonQty: 12,
      priceTiers: [
        { moq: 12, pricePerPair: 2200, label: "Starter (1-4 Ctns)" },
        { moq: 60, pricePerPair: 1950, label: "Dealer (5-19 Ctns)" },
        { moq: 240, pricePerPair: 1750, label: "Wholesale (20-49 Ctns)" },
      ],
      leadTimeDays: "7–10 days",
      priceLabel: "PKR 1,750–2,200",
      productionCapacity: "15,000 pairs/month",
      customization: ["Gold Insole Embossing", "Custom Box"],
      sampleAvailable: true,
      samplePrice: 2800,
      sampleLeadDays: "2–3 days",
      sampleRefundable: true,
      inStock: true,
      featured: true,
      bestseller: false,
      trending: true,
      newArrival: true,
      description: "Handcrafted presidential edition Peshawari chappal with gold welt stitching.",
      specifications: {
        "Upper Material": "Full-Grain Cowhide Leather",
        "Sole Material": "Direct Injection TPU Sole",
        Gender: "men",
        "Minimum Order": "12 pairs (1 carton)",
      },
      shippingInfo: "Shipped in cartons of 12 pairs.",
      reviews: [],
      stats: {
        unitsSold: 0,
        ordersCompleted: 0,
        activeBuyers: 0,
        repeatPurchasePct: 100,
      },
    };

    // Admin performProductAction (CREATE)
    const res = await apiClient.admin.performProductAction("CREATE", newProduct);
    expect(res.success).toBe(true);

    // User Side: Verify product list has increased
    const currentProducts = getStoredProducts();
    expect(currentProducts.length).toBe(initialCount + 1);

    // User Side: Verify getProduct resolves via exact slug
    const foundBySlug = getProduct("anm-royal-peshawari-999");
    expect(foundBySlug).toBeDefined();
    expect(foundBySlug?.name).toBe("Royal Velvet Peshawari Handcrafted");

    // User Side: Verify getProduct resolves case-insensitively and via SKU
    const foundCase = getProduct("ANM-ROYAL-PESHAWARI-999");
    expect(foundCase).toBeDefined();
    expect(foundCase?.sku).toBe("ANM-RYL-999");

    const foundBySku = getProduct("ANM-RYL-999");
    expect(foundBySku).toBeDefined();
    expect(foundBySku?.name).toBe("Royal Velvet Peshawari Handcrafted");

    // User Side: Verify apiClient.catalog.list returns the new product
    const catalogListRes = await apiClient.catalog.list({ category: "men-peshawari" });
    expect(catalogListRes.success).toBe(true);
    const inCatalog = catalogListRes.data.products.find((p: Product) => p.slug === "anm-royal-peshawari-999");
    expect(inCatalog).toBeDefined();
  });

  it("2. should successfully UPDATE product attributes from Admin and reflect on User Side", async () => {
    // 1. Get first product
    const first = getStoredProducts()[0];
    expect(first).toBeDefined();

    const updatedPriceTiers = [
      { moq: 12, pricePerPair: 2500, label: "Starter Revised" },
      { moq: 60, pricePerPair: 2100, label: "Dealer Revised" },
    ];

    const updates: Partial<Product> = {
      name: "Updated Premium Edition Footwear",
      priceLabel: "PKR 2,100–2,500",
      priceTiers: updatedPriceTiers,
      inStock: false,
      featured: false,
      bestseller: true,
    };

    // Admin performProductAction (UPDATE)
    const updateRes = await apiClient.admin.performProductAction("UPDATE", {
      slug: first.slug,
      ...updates,
    });
    expect(updateRes.success).toBe(true);

    // User Side: Verify updated attributes
    const fetched = getProduct(first.slug);
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe("Updated Premium Edition Footwear");
    expect(fetched?.priceLabel).toBe("PKR 2,100–2,500");
    expect(fetched?.inStock).toBe(false);
    expect(fetched?.bestseller).toBe(true);
    expect(fetched?.priceTiers[0].pricePerPair).toBe(2500);

    // User Side: Verify apiClient.catalog.get resolves updated product
    const apiGetRes = await apiClient.catalog.get(first.slug);
    expect(apiGetRes.success).toBe(true);
    expect(apiGetRes.data.name).toBe("Updated Premium Edition Footwear");
  });

  it("3. should dynamically calculate Category Product Counts based on active CRUD state", () => {
    const categoriesBefore = getCategoriesWithCounts();
    const peshawariBefore = categoriesBefore.find((c) => c.slug === "men-peshawari")?.productCount || 0;

    // Add a new Peshawari product
    addStoredProduct({
      slug: "test-peshawari-dynamic",
      sku: "TEST-PSH-01",
      name: "Dynamic Test Peshawari",
      nameUrdu: "ٹیسٹ پشاوری",
      categorySlug: "men-peshawari",
      gender: "men",
      image: "",
      images: [],
      material: "Leather",
      soleType: "Rubber",
      colorVariants: [],
      colors: ["Black"],
      sizes: ["8", "9", "10"],
      moq: 12,
      cartonQty: 12,
      priceTiers: [{ moq: 12, pricePerPair: 1500, label: "Starter" }],
      leadTimeDays: "7 days",
      priceLabel: "PKR 1,500",
      productionCapacity: "5000",
      inStock: true,
      description: "Test",
      specifications: {},
      shippingInfo: "",
      reviews: [],
      stats: { unitsSold: 0, ordersCompleted: 0, activeBuyers: 0, repeatPurchasePct: 100 },
    });

    const categoriesAfter = getCategoriesWithCounts();
    const peshawariAfter = categoriesAfter.find((c) => c.slug === "men-peshawari")?.productCount || 0;

    expect(peshawariAfter).toBe(peshawariBefore + 1);
  });

  it("4. should successfully DELETE a product from Admin and remove from User Catalog", async () => {
    const prods = getStoredProducts();
    const target = prods[0];
    const initialCount = prods.length;

    // Admin performProductAction (DELETE)
    const deleteRes = await apiClient.admin.performProductAction("DELETE", target);
    expect(deleteRes.success).toBe(true);

    // User Side: Verify product count reduced
    const afterDelete = getStoredProducts();
    expect(afterDelete.length).toBe(initialCount - 1);

    // User Side: getProduct returns undefined for deleted item
    expect(getProduct(target.slug)).toBeUndefined();
    expect(getProduct(target.sku)).toBeUndefined();

    // User Side: apiClient.catalog.get returns 404/not found
    const getRes = await apiClient.catalog.get(target.slug);
    expect(getRes.success).toBe(false);
  });

  it("5. should cleanly RESET to factory defaults on command", () => {
    // Delete all products
    saveStoredProducts([]);
    expect(getStoredProducts().length).toBe(0);

    // Reset
    const restored = resetStoredProducts();
    expect(restored.length).toBeGreaterThan(0);
    expect(getStoredProducts().length).toBe(restored.length);
  });
});
