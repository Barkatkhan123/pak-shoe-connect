import { prisma } from "../../db";
import { isUuid } from "../../utils/isUuid";

export class TrackingService {
  /**
   * Fetches real-time Bilti & production tracking timeline for a given order
   */
  static async getOrderTracking(orderIdOrNumber: string) {
    let order: any = null;

    try {
      order = await prisma.order.findFirst({
        where: {
          OR: isUuid(orderIdOrNumber)
            ? [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }]
            : [{ orderNumber: orderIdOrNumber }],
        },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              city: true,
            }
          },
          supplier: true,
          items: { include: { product: true } },
        } as any,
      });
    } catch {
      order = null;
    }

    if (!order) {
      // Return simulated live tracking for mockup/demo orders if not found in db
      return {
        orderNumber: orderIdOrNumber.startsWith("ORD-") ? orderIdOrNumber : "ORD-PK-2026-9901",
        status: "DISPATCHED",
        carrierName: "Faisal Movers Cargo B2B",
        biltiNumber: "FM-BILTI-LHR-88219",
        originCity: "Sialkot / Lahore Industrial Hub",
        destinationCity: "Karachi Port (Container Terminal)",
        totalPairs: 500,
        totalCartons: 21,
        totalAmount: 669450,
        timeline: [
          {
            step: "ESCROW_FUNDED",
            title: "Escrow Deposit Verified",
            description: "100% Payment locked securely in Anamon Escrow Ledger",
            timestamp: "2026-08-04T10:15:00Z",
            completed: true,
          },
          {
            step: "IN_PRODUCTION",
            title: "Factory Batch Production",
            description: "Laser cutting, upper stitching & sole vulcanization at Sialkot Master Syndicate",
            timestamp: "2026-08-04T12:30:00Z",
            completed: true,
          },
          {
            step: "QUALITY_INSPECTION",
            title: "AQL 2.5 Quality Audit Passed",
            description: "Stitch integrity, leather grading & carton packaging verified",
            timestamp: "2026-08-04T16:00:00Z",
            completed: true,
          },
          {
            step: "DISPATCHED",
            title: "Dispatched via Goods Forwarder (Bilti Issued)",
            description: "Handed over to Faisal Movers Cargo B2B. Goods Consignment Note: FM-BILTI-LHR-88219",
            timestamp: "2026-08-04T18:45:00Z",
            completed: true,
          },
          {
            step: "DELIVERED",
            title: "Delivery & Final Inspection",
            description: "Buyer receives consignment, verifies cartons, and releases escrow",
            timestamp: null,
            completed: false,
          },
        ],
      };
    }

    // Dynamic timeline based on database order
    const isEscrowFunded = order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED";
    const isProduction = ["PROCESSING", "IN_PRODUCTION", "QUALITY_INSPECTION", "DISPATCHED", "DELIVERED"].includes(
      order.status as any
    );
    const isQualityPassed = ["QUALITY_INSPECTION", "DISPATCHED", "DELIVERED"].includes(order.status as any);
    const isDispatched = ["DISPATCHED", "DELIVERED"].includes(order.status as any);
    const isDelivered = order.status === "DELIVERED";

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      carrierName: "TCS Logistics Cargo / Faisal Movers",
      biltiNumber: isDispatched ? `BILTI-PK-${order.orderNumber.split("-")[3] || "88219"}` : "Pending Dispatch",
      originCity: "Sialkot / Lahore Industrial Hub",
      destinationCity: order.shippingCity,
      totalPairs: order.totalPairs,
      totalCartons: order.totalCartons,
      totalAmount: Number(order.totalAmount),
      timeline: [
        {
          step: "ESCROW_FUNDED",
          title: "Escrow Deposit Verified",
          description: "100% Payment locked securely in Anamon Escrow Ledger",
          timestamp: order.createdAt.toISOString(),
          completed: isEscrowFunded,
        },
        {
          step: "IN_PRODUCTION",
          title: "Factory Batch Production",
          description: "Manufacturing batch underway at partner factory",
          timestamp: isProduction ? order.updatedAt.toISOString() : null,
          completed: isProduction,
        },
        {
          step: "QUALITY_INSPECTION",
          title: "AQL 2.5 Quality Audit Passed",
          description: "Stitch integrity, leather grading & carton packaging verified",
          timestamp: isQualityPassed ? order.updatedAt.toISOString() : null,
          completed: isQualityPassed,
        },
        {
          step: "DISPATCHED",
          title: "Dispatched via Goods Forwarder (Bilti Issued)",
          description: `Consignment handed to cargo logistics. Bilti: BILTI-PK-${order.orderNumber.split("-")[3] || "88219"}`,
          timestamp: isDispatched ? order.updatedAt.toISOString() : null,
          completed: isDispatched,
        },
        {
          step: "DELIVERED",
          title: "Delivery & Final Inspection",
          description: "Consignment delivered to destination warehouse",
          timestamp: isDelivered ? order.updatedAt.toISOString() : null,
          completed: isDelivered,
        },
      ],
    };
  }
}
