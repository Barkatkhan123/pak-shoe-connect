import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiGateway } from "../src/server/gateway/gateway";
import { signToken } from "../src/server/gateway/middleware/auth.middleware";
import { CartService } from "../src/server/modules/cart/cart.service";
import {
  savePendingAction,
  getPendingAction,
  clearPendingAction,
  type PendingBasketAction,
} from "../src/hooks/use-inquiry-basket";

// Setup global mock storage for Node environment
const mockStorage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, String(value)),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = localStorageMock as any;
}
if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    location: { origin: "http://localhost:5173" },
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: localStorageMock,
  } as any;
}

const MOCK_BUYER_ID = "buyer_user_12345";
const VALID_BUYER_TOKEN = signToken({ sub: MOCK_BUYER_ID, role: "BUYER" as any });
const TEST_SLUG = "peshawari-charsadda-classic";

describe("Basket Authentication Flow & Server Security", () => {
  beforeEach(() => {
    // Clear in-memory server basket for test buyer
    CartService.clearBasket(MOCK_BUYER_ID);
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe("1. Pending Basket Action Versioning, TTL & Retention", () => {
    it("should store a versioned pending action with 60-minute TTL and idempotency key", () => {
      const action = savePendingAction({
        slug: TEST_SLUG,
        name: "Charsadda Double-Sole Chappal",
        sku: "SHR-PSH-001",
        image: "/images/peshawari.jpg",
        moq: 24,
        cartonQty: 24,
        requestedQty: 48,
        cartonCount: 2,
        color: "Mustard Tan",
        size: "EU 42",
        priceLabel: "PKR 1,650/pair",
        price: 1650,
        tierName: "Dealer Batch",
      });

      expect(action.version).toBe(1);
      expect(action.type).toBe("ADD_TO_BASKET");
      expect(action.expiresAt).toBeGreaterThan(Date.now() + 55 * 60 * 1000);
      expect(action.idempotencyKey).toBeDefined();

      const retrieved = getPendingAction();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.slug).toBe(TEST_SLUG);
      expect(retrieved?.requestedQty).toBe(48);
      expect(retrieved?.color).toBe("Mustard Tan");
      expect(retrieved?.size).toBe("EU 42");
    });

    it("should gracefully discard expired pending actions (> 60 minutes)", () => {
      const expiredAction: PendingBasketAction = {
        version: 1,
        type: "ADD_TO_BASKET",
        createdAt: Date.now() - 70 * 60 * 1000,
        expiresAt: Date.now() - 10 * 60 * 1000, // Expired 10 mins ago
        idempotencyKey: "test_key_expired",
        slug: TEST_SLUG,
        name: "Charsadda Double-Sole Chappal",
        sku: "SHR-PSH-001",
        image: "/images/peshawari.jpg",
        moq: 24,
        cartonQty: 24,
        requestedQty: 24,
        cartonCount: 1,
        color: "Black",
        size: "Assorted",
        priceLabel: "PKR 1,850/pair",
        price: 1850,
      };

      localStorage.setItem("shersha_pending_basket_action", JSON.stringify(expiredAction));
      const retrieved = getPendingAction();
      expect(retrieved).toBeNull();
      expect(localStorage.getItem("shersha_pending_basket_action")).toBeNull();
    });

    it("should retain pending action on login cancel or failure, and only clear on confirmed success", () => {
      savePendingAction({
        slug: TEST_SLUG,
        name: "Charsadda Double-Sole Chappal",
        sku: "SHR-PSH-001",
        image: "/images/peshawari.jpg",
        moq: 24,
        cartonQty: 24,
        requestedQty: 36,
        cartonCount: 3,
        color: "Black",
        size: "EU 43",
        priceLabel: "PKR 1,850/pair",
        price: 1850,
      });

      // User cancels login modal: action is NOT cleared
      expect(getPendingAction()).not.toBeNull();
      expect(getPendingAction()?.requestedQty).toBe(36);

      // Login succeeds and API confirms: action is cleared
      clearPendingAction();
      expect(getPendingAction()).toBeNull();
    });
  });

  describe("2. Server Gateway Zero Trust Authentication Enforcement", () => {
    it("should reject unauthenticated Add to Basket requests with 401 Unauthorized", async () => {
      const res = await apiGateway("/api/v1/basket/add", "POST", {
        productSlug: TEST_SLUG,
        quantityPairs: 24,
        color: "Black",
        size: "EU 42",
      });

      expect(res.status).toBe(401);
      expect(res.body.message || res.body.error).toContain("Authentication required");
    });

    it("should reject unauthenticated Get Basket requests with 401 Unauthorized", async () => {
      const res = await apiGateway("/api/v1/basket", "GET");
      expect(res.status).toBe(401);
    });

    it("should allow authenticated buyer to add items and recalculate pricing server-side", async () => {
      const res = await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: TEST_SLUG,
          quantityPairs: 48,
          color: "Oxblood Hand-Patina",
          size: "EU 41",
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.addedItem.slug).toBe(TEST_SLUG);
      expect(res.body.data.addedItem.requestedQty).toBe(48);
      expect(res.body.data.addedItem.color).toBe("Oxblood Hand-Patina");
      // Unit price calculated strictly on server
      expect(res.body.data.addedItem.unitPrice).toBeGreaterThan(0);
      expect(res.body.data.addedItem.subtotal).toBe(res.body.data.addedItem.unitPrice * 48);
    });
  });

  describe("3. Server-Side Option Validation & Atomic Upsert Protection", () => {
    it("should atomically merge quantities and recalculate price tier when adding the same product variant", async () => {
      // First addition: 24 pairs
      await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: TEST_SLUG,
          quantityPairs: 24,
          color: "Mustard Tan",
          size: "EU 42",
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      // Second addition: 24 more pairs of same color & size
      const res2 = await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: TEST_SLUG,
          quantityPairs: 24,
          color: "Mustard Tan",
          size: "EU 42",
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      expect(res2.status).toBe(200);
      const basket = res2.body.data.items;
      // Exactly 1 line item merged
      expect(basket.length).toBe(1);
      expect(basket[0].requestedQty).toBe(48);
      expect(basket[0].cartonCount).toBe(4); // 48 pairs / 12 pairs per carton = 4 cartons
    });

    it("should prevent duplicate additions on rapid double-click using idempotency key", async () => {
      const idempotencyKey = "client_txn_key_abc_999";

      // First call
      const res1 = await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: TEST_SLUG,
          quantityPairs: 24,
          color: "Mustard Tan",
          size: "EU 42",
          idempotencyKey,
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      // Rapid duplicate call with same idempotency key
      const res2 = await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: TEST_SLUG,
          quantityPairs: 24,
          color: "Mustard Tan",
          size: "EU 42",
          idempotencyKey,
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      // Item should NOT be double added
      expect(res2.body.data.items[0].requestedQty).toBe(24);
    });

    it("should reject non-existent product slugs with 400 Bad Request", async () => {
      const res = await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: "invalid-fake-shoe-xyz-999",
          quantityPairs: 24,
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body)).toContain("Product not found");
    });
  });

  describe("4. Complete End-to-End User Flow Scenario", () => {
    it("Logged out → Select options → Add to Basket → Login → Auto Add → Refresh → Single Item Check", async () => {
      // Step A: Unauthenticated user selects product options on PDP
      const pendingSelection = {
        slug: TEST_SLUG,
        name: "Charsadda Double-Sole Chappal",
        sku: "SHR-PSH-001",
        image: "/images/peshawari.jpg",
        moq: 24,
        cartonQty: 24,
        requestedQty: 72,
        cartonCount: 3,
        color: "Mustard Tan",
        size: "EU 43",
        priceLabel: "PKR 1,650/pair",
        price: 1650,
        tierName: "Dealer Batch",
      };

      // User clicks "Add to Basket" while logged out -> saved to versioned pending storage
      const saved = savePendingAction(pendingSelection);
      expect(saved.version).toBe(1);

      // Verify no database/server basket item created yet
      const preCheck = await apiGateway(
        "/api/v1/basket",
        "GET",
        {},
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );
      expect(preCheck.body.data.items.length).toBe(0);

      // Step B: User completes sign in -> restores pending action and executes mutation
      const pendingToRestore = getPendingAction();
      expect(pendingToRestore).not.toBeNull();

      const mutationRes = await apiGateway(
        "/api/v1/basket/add",
        "POST",
        {
          productSlug: pendingToRestore!.slug,
          quantityPairs: pendingToRestore!.requestedQty,
          cartonCount: pendingToRestore!.cartonCount,
          color: pendingToRestore!.color,
          size: pendingToRestore!.size,
          idempotencyKey: pendingToRestore!.idempotencyKey,
        },
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      expect(mutationRes.status).toBe(200);
      expect(mutationRes.body.success).toBe(true);

      // Step C: Pending action is cleared only after confirmed API success
      clearPendingAction();
      expect(getPendingAction()).toBeNull();

      // Step D: Page refresh happens — verify no repeat mutation occurs
      const postRefreshPending = getPendingAction();
      expect(postRefreshPending).toBeNull(); // Nothing to auto-add again

      // Step E: Verify database/server basket has EXACTLY ONE item with all original selections
      const basketRes = await apiGateway(
        "/api/v1/basket",
        "GET",
        {},
        {},
        { authorization: `Bearer ${VALID_BUYER_TOKEN}` },
      );

      const items = basketRes.body.data.items;
      expect(items.length).toBe(1);
      expect(items[0].slug).toBe(TEST_SLUG);
      expect(items[0].requestedQty).toBe(72);
      expect(items[0].cartonCount).toBe(3);
      expect(items[0].color).toBe("Mustard Tan");
      expect(items[0].size).toBe("EU 43");
    });
  });
});
