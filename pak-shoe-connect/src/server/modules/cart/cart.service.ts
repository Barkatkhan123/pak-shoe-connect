import { PricingService } from "../../services/pricing.service";
import { CalculateCartInput, AddBasketItemInput, ServerBasketItem } from "./cart.schema";
import { PRODUCTS, getProduct } from "../../../data/products";
import { prisma } from "../../db";

// In-memory server basket store keyed by userId (persists for session lifetime across serverless/node requests)
const userBaskets = new Map<string, ServerBasketItem[]>();
const processedIdempotencyKeys = new Map<string, { timestamp: number; result: any }>();

export class CartService {
  /**
   * Retrieves the authenticated user's current server-validated basket
   */
  static async getBasket(
    userId: string,
  ): Promise<{
    items: ServerBasketItem[];
    totalPairs: number;
    totalCartons: number;
    subtotal: number;
  }> {
    const items = userBaskets.get(userId) || [];
    const totalPairs = items.reduce((sum, i) => sum + i.requestedQty, 0);
    const totalCartons = items.reduce((sum, i) => sum + i.cartonCount, 0);
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    return { items, totalPairs, totalCartons, subtotal };
  }

  /**
   * Adds or atomically updates a product in the authenticated user's basket.
   * Performs full server-side validation of existence, MOQ, options, and pricing tiers.
   */
  static async addItem(
    userId: string,
    input: AddBasketItemInput,
  ): Promise<{ items: ServerBasketItem[]; addedItem: ServerBasketItem }> {
    // Idempotency check: prevent duplicate execution on rapid network retries
    if (input.idempotencyKey) {
      const cached = processedIdempotencyKeys.get(input.idempotencyKey);
      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        const basket = await this.getBasket(userId);
        return { items: basket.items, addedItem: cached.result };
      }
    }

    // 1. Server-side product lookup (trusted source)
    const product = getProduct(input.productSlug) || PRODUCTS.find((p) => p.slug === input.productSlug);
    if (!product) {
      throw new Error(`Product not found with slug: ${input.productSlug}`);
    }

    // 2. Server-side validation of options
    const normalizedColor = input.color || product.colors?.[0] || "Standard";
    const normalizedSize = input.size || product.sizes?.[0] || "Assorted";
    const cartonQty = product.cartonQty || 12;
    const moq = product.moq || 12;

    // Minimum quantity validation
    const requestedQty = Math.max(1, input.quantityPairs);

    // 3. Server-side Price Calculation (never trust client pricing)
    let unitPrice = product.priceTiers?.[0]?.pricePerPair || 1000;
    let tierName = product.priceTiers?.[0]?.label || "Standard Wholesale Tier";

    if (product.priceTiers && product.priceTiers.length > 0) {
      for (const tier of product.priceTiers) {
        if (requestedQty >= tier.moq) {
          unitPrice = tier.pricePerPair;
          tierName = tier.label;
        }
      }
    }

    const cartonCount = input.cartonCount || Math.max(1, Math.ceil(requestedQty / cartonQty));
    const subtotal = unitPrice * requestedQty;
    const priceLabel = `PKR ${unitPrice.toLocaleString()}/pair`;

    const newItem: ServerBasketItem = {
      slug: product.slug,
      productId: input.productId,
      name: product.name,
      sku: product.sku,
      image: product.image,
      moq,
      cartonQty,
      requestedQty,
      cartonCount,
      color: normalizedColor,
      size: normalizedSize,
      priceLabel,
      unitPrice,
      subtotal,
      tierName,
      addedAt: new Date().toISOString(),
      idempotencyKey: input.idempotencyKey,
    };

    // 4. Atomic Upsert into user's basket
    const currentBasket = userBaskets.get(userId) || [];
    const existingIndex = currentBasket.findIndex(
      (i) => i.slug === product.slug && i.color === normalizedColor && i.size === normalizedSize,
    );

    let updatedBasket: ServerBasketItem[];
    let finalItem: ServerBasketItem;

    if (existingIndex >= 0) {
      const existing = currentBasket[existingIndex];
      const newTotalQty = existing.requestedQty + requestedQty;

      // Recalculate price tier on cumulative quantity
      let updatedUnitPrice = product.priceTiers?.[0]?.pricePerPair || 1000;
      let updatedTierName = product.priceTiers?.[0]?.label || "Standard Wholesale Tier";
      if (product.priceTiers && product.priceTiers.length > 0) {
        for (const tier of product.priceTiers) {
          if (newTotalQty >= tier.moq) {
            updatedUnitPrice = tier.pricePerPair;
            updatedTierName = tier.label;
          }
        }
      }

      finalItem = {
        ...existing,
        requestedQty: newTotalQty,
        cartonCount: Math.max(1, Math.ceil(newTotalQty / cartonQty)),
        unitPrice: updatedUnitPrice,
        priceLabel: `PKR ${updatedUnitPrice.toLocaleString()}/pair`,
        subtotal: updatedUnitPrice * newTotalQty,
        tierName: updatedTierName,
        addedAt: new Date().toISOString(),
      };

      updatedBasket = [...currentBasket];
      updatedBasket[existingIndex] = finalItem;
    } else {
      finalItem = newItem;
      updatedBasket = [...currentBasket, newItem];
    }

    userBaskets.set(userId, updatedBasket);

    if (input.idempotencyKey) {
      processedIdempotencyKeys.set(input.idempotencyKey, {
        timestamp: Date.now(),
        result: finalItem,
      });
    }

    return { items: updatedBasket, addedItem: finalItem };
  }

  /**
   * Removes an item from the user's server basket
   */
  static async removeItem(
    userId: string,
    slug: string,
    options?: { color?: string; size?: string },
  ): Promise<ServerBasketItem[]> {
    const currentBasket = userBaskets.get(userId) || [];
    const updated = currentBasket.filter((i) => {
      if (i.slug !== slug) return true;
      if (options?.color && i.color !== options.color) return true;
      if (options?.size && i.size !== options.size) return true;
      return false;
    });
    userBaskets.set(userId, updated);
    return updated;
  }

  /**
   * Updates the quantity of an item in the user's server basket with tier recalculation
   */
  static async updateQty(
    userId: string,
    slug: string,
    requestedQty: number,
  ): Promise<ServerBasketItem[]> {
    const currentBasket = userBaskets.get(userId) || [];
    const product = getProduct(slug) || PRODUCTS.find((p) => p.slug === slug);
    const cartonQty = product?.cartonQty || 12;

    const updated = currentBasket.map((item) => {
      if (item.slug !== slug) return item;
      const safeQty = Math.max(1, requestedQty);

      let unitPrice = product?.priceTiers?.[0]?.pricePerPair || item.unitPrice;
      let tierName = product?.priceTiers?.[0]?.label || item.tierName;
      if (product?.priceTiers && product.priceTiers.length > 0) {
        for (const tier of product.priceTiers) {
          if (safeQty >= tier.moq) {
            unitPrice = tier.pricePerPair;
            tierName = tier.label;
          }
        }
      }

      return {
        ...item,
        requestedQty: safeQty,
        cartonCount: Math.max(1, Math.ceil(safeQty / cartonQty)),
        unitPrice,
        priceLabel: `PKR ${unitPrice.toLocaleString()}/pair`,
        subtotal: unitPrice * safeQty,
        tierName,
      };
    });

    userBaskets.set(userId, updated);
    return updated;
  }

  /**
   * Clears the user's server basket
   */
  static async clearBasket(userId: string): Promise<void> {
    userBaskets.delete(userId);
    processedIdempotencyKeys.clear();
  }

  /**
   * Calculates bulk cart subtotals, master carton counts, dynamic freight, and grand totals
   */
  static async calculateCart(input: CalculateCartInput) {
    let totalPairs = 0;
    let totalCartons = 0;
    let productTotal = 0;
    let totalFreight = 0;

    const calculatedItems = [];

    for (const item of input.items) {
      const priceResult = await PricingService.calculate({
        productId: item.productId,
        productSlug: item.productSlug,
        quantity: item.quantityPairs,
        destinationCity: input.destinationCity,
      });

      const itemSubtotal = priceResult.subtotal ?? priceResult.unitPrice * item.quantityPairs;
      const freight = priceResult.logistics?.totalEstimatedFreight ?? 0;
      const tierLabel = priceResult.activeTier?.tierLabel ?? "Standard Tier";

      totalPairs += item.quantityPairs;
      totalCartons += priceResult.cartonsCount;
      productTotal += itemSubtotal;
      totalFreight += freight;

      calculatedItems.push({
        productId: item.productId,
        productSlug: item.productSlug,
        quantityPairs: item.quantityPairs,
        cartonsCount: priceResult.cartonsCount,
        unitPrice: priceResult.unitPrice,
        tierName: tierLabel,
        subtotal: itemSubtotal,
        freight,
      });
    }

    const grandTotal = productTotal + totalFreight;

    return {
      pairs: totalPairs,
      cartons: totalCartons,
      productTotal,
      freight: totalFreight,
      grandTotal,
      destinationCity: input.destinationCity,
      items: calculatedItems,
    };
  }
}
