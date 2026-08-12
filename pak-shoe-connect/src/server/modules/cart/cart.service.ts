import { PricingService } from "../../services/pricing.service";
import { CalculateCartInput } from "./cart.schema";

export class CartService {
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

      const itemSubtotal = priceResult.subtotal ?? (priceResult.unitPrice * item.quantityPairs);
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
