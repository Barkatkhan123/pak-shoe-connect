import { prisma } from "../db";
import { OrderStatus, EscrowState, PaymentStatus, PaymentProvider } from "@prisma/client";
import { z } from "zod";
import { PricingService } from "./pricing.service";

export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid(),
  color: z.string(),
  sizeRun: z.string(),
  quantityPairs: z.number().int().min(1),
  variantSku: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  buyerId: z.string().uuid(),
  rfqId: z.string().uuid().optional(),
  shippingCity: z.string(),
  shippingAddress: z.string().min(5),
  items: z.array(CreateOrderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export class OrderService {
  private static generateOrderNumber(): string {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const year = new Date().getFullYear();
    return `ORD-PK-${year}-${randomSuffix}`;
  }

  /**
   * Creates an order and locks inventory in 3-state reservation (available -> reserved)
   */
  static async createOrderWithReservation(input: CreateOrderInput) {
    const validated = CreateOrderSchema.parse(input);
    const orderNumber = this.generateOrderNumber();

    const reservationExpiresAt = new Date();
    reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 60);

    return await prisma.$transaction(async (tx) => {
      let totalPairs = 0;
      let totalCartons = 0;
      let subtotalAmount = 0;

      let calculatedTotalFreight = 0;
      const orderItemsData = [];

      for (const item of validated.items) {
        const priceInfo = await PricingService.calculate({
          productId: item.productId,
          quantity: item.quantityPairs,
          destinationCity: validated.shippingCity,
        });

        if (priceInfo.isMoqMet === false) {
          throw new Error(
            `Quantity ${item.quantityPairs} does not meet Minimum Order Quantity (${priceInfo.moq}) for product ${item.productId}`,
          );
        }

        const itemSubtotal = priceInfo.unitPrice * item.quantityPairs;
        const itemFreight = priceInfo.logistics?.totalEstimatedFreight ?? 0;
        calculatedTotalFreight += itemFreight;
        totalPairs += item.quantityPairs;
        totalCartons += priceInfo.cartonsCount;
        subtotalAmount += itemSubtotal;

        let skuToReserve = item.variantSku;
        if (!skuToReserve) {
          const sizeMatch = item.sizeRun.match(/(\d{2})/);
          const sizeEU = sizeMatch?.[1];
          if (sizeEU) {
            const foundVar = await tx.productVariant.findFirst({
              where: { productId: item.productId, colorName: item.color, sizeEU },
            });
            if (foundVar) {
              skuToReserve = foundVar.variantSku;
            }
          }
        }

        if (!skuToReserve) {
          throw new Error(
            `Unable to resolve product variant SKU for product ${item.productId} (${item.color}, ${item.sizeRun})`,
          );
        }

        const reservation = await tx.productVariant.updateMany({
          where: {
            variantSku: skuToReserve,
            availableStock: { gte: item.quantityPairs },
          },
          data: {
            availableStock: { decrement: item.quantityPairs },
            reservedStock: { increment: item.quantityPairs },
          },
        });

        if (reservation.count === 0) {
          const variant = await tx.productVariant.findUnique({
            where: { variantSku: skuToReserve },
          });
          const available = variant?.availableStock ?? 0;
          throw new Error(
            `Insufficient stock for SKU ${skuToReserve}. Available: ${available}, Requested: ${item.quantityPairs}`,
          );
        }

        orderItemsData.push({
          productId: item.productId,
          color: item.color,
          sizeRun: item.sizeRun,
          variantSku: skuToReserve || item.variantSku,
          quantityPairs: item.quantityPairs,
          cartonsCount: priceInfo.cartonsCount,
          unitPrice: priceInfo.unitPrice,
          totalPrice: itemSubtotal,
        });
      }

      const freightAmount = calculatedTotalFreight;
      const totalAmount = subtotalAmount + freightAmount;

      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId: validated.buyerId,
          rfqId: validated.rfqId,
          status: OrderStatus.PENDING_PAYMENT,
          escrowStatus: EscrowState.UNPAID,
          totalPairs,
          totalCartons,
          subtotalAmount,
          freightAmount,
          totalAmount,
          shippingCity: validated.shippingCity,
          shippingAddress: validated.shippingAddress,
          reservationExpiresAt,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: { include: { product: true } },
          buyer: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: validated.buyerId,
          action: "ORDER_CREATED_STOCK_RESERVED",
          entityType: "ORDER",
          entityId: order.id,
          newValues: {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            totalPairs: order.totalPairs,
            reservationExpiresAt,
          },
        },
      });

      return order;
    });
  }

  /**
   * Confirms payment and transitions stock from reserved -> sold.
   * Used by verified webhooks and admin manual confirmation only.
   */
  static async confirmPaymentAndFundEscrow(params: {
    orderId: string;
    paymentTxId: string;
    amount: number;
    provider: PaymentProvider | string;
    verifiedByAdmin?: boolean;
    adminUserId?: string;
    reason?: string;
  }) {
    const provider =
      typeof params.provider === "string"
        ? (params.provider.toUpperCase().replace(/-/g, "_") as PaymentProvider)
        : params.provider;

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order ${params.orderId} not found`);
      }

      if (order.status === OrderStatus.ESCROW_FUNDED) {
        return order;
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new Error(
          `Order ${params.orderId} is not awaiting payment (status: ${order.status})`,
        );
      }

      const paidAmount = Number(params.amount);
      const requiredAmount = Number(order.totalAmount);
      if (isNaN(paidAmount) || paidAmount < requiredAmount) {
        throw new Error(
          `Underpayment or invalid payment amount detected: Received ${params.amount}, required ${order.totalAmount}`,
        );
      }

      const existingPayment = await tx.paymentTransaction.findUnique({
        where: { providerTxId: params.paymentTxId },
      });
      if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
        return order;
      }

      // Atomic status transition to prevent duplicate webhook race conditions
      const atomicUpdate = await tx.order.updateMany({
        where: { id: params.orderId, status: OrderStatus.PENDING_PAYMENT },
        data: {
          status: OrderStatus.ESCROW_FUNDED,
          escrowStatus: EscrowState.HELD_IN_ESCROW,
        },
      });

      if (atomicUpdate.count === 0) {
        const freshOrder = await tx.order.findUnique({
          where: { id: params.orderId },
          include: { items: true },
        });
        if (freshOrder?.status === OrderStatus.ESCROW_FUNDED) {
          return freshOrder;
        }
        throw new Error(`Order ${params.orderId} is not awaiting payment`);
      }

      for (const item of order.items) {
        if (item.variantSku) {
          await tx.productVariant.update({
            where: { variantSku: item.variantSku },
            data: {
              reservedStock: { decrement: item.quantityPairs },
              soldStock: { increment: item.quantityPairs },
            },
          });
        } else {
          const sizeMatch = item.sizeRun.match(/(\d{2})/);
          const sizeEU = sizeMatch?.[1];
          if (sizeEU) {
            await tx.productVariant.updateMany({
              where: {
                productId: item.productId,
                colorName: item.color,
                sizeEU,
              },
              data: {
                reservedStock: { decrement: item.quantityPairs },
                soldStock: { increment: item.quantityPairs },
              },
            });
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.ESCROW_FUNDED,
          escrowStatus: EscrowState.HELD_IN_ESCROW,
        },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider,
          providerTxId: params.paymentTxId,
          amount: params.amount,
          status: PaymentStatus.SUCCESS,
          verifiedByAdmin: params.verifiedByAdmin ?? false,
          rawResponse: params.reason
            ? { adminReason: params.reason, confirmedBy: params.adminUserId }
            : undefined,
        },
      });

      await tx.escrowLedger.create({
        data: {
          orderId: order.id,
          amount: params.amount,
          type: "DEPOSIT_INTO_ESCROW",
          reference: params.paymentTxId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: params.adminUserId || order.buyerId,
          action: params.verifiedByAdmin
            ? "ADMIN_MANUAL_PAYMENT_CONFIRMED"
            : "WEBHOOK_PAYMENT_CONFIRMED",
          entityType: "Order",
          entityId: order.id,
          newValues: {
            paymentTxId: params.paymentTxId,
            amount: params.amount,
            provider,
            reason: params.reason,
          },
        },
      });

      return updatedOrder;
    });
  }
}
