import crypto from "crypto";
import { EscrowState, OrderStatus } from "@prisma/client";
import { prisma } from "../../db";
import { isUuid } from "../../utils/isUuid";
import { EscrowLifecycleState, EscrowStateMachine } from "./escrow-state-machine";
import { CommissionService, SupplierTier } from "./commission.service";

export interface EscrowAccount {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: EscrowLifecycleState;
  supplierId: string;
  supplierTier: SupplierTier;
  supplierReleaseAmount: number;
  platformCommissionAmount: number;
  fundedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  ledger: Array<{
    id: string;
    type: "HOLD_DEPOSIT" | "SUPPLIER_PAYOUT" | "PLATFORM_COMMISSION" | "BUYER_REFUND";
    amount: number;
    reference: string;
    timestamp: Date;
  }>;
}

interface EscrowMetadata {
  lifecycleStatus: EscrowLifecycleState;
  supplierId: string;
  supplierTier: SupplierTier;
  supplierReleaseAmount: number;
  platformCommissionAmount: number;
  fundedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
}

const LEDGER_TYPE_MAP: Record<string, EscrowAccount["ledger"][number]["type"]> = {
  HOLD_DEPOSIT: "HOLD_DEPOSIT",
  SUPPLIER_PAYOUT: "SUPPLIER_PAYOUT",
  PLATFORM_COMMISSION: "PLATFORM_COMMISSION",
  BUYER_REFUND: "BUYER_REFUND",
  DEPOSIT_INTO_ESCROW: "HOLD_DEPOSIT",
};

function parseMetadata(reference: string): EscrowMetadata | null {
  try {
    return JSON.parse(reference) as EscrowMetadata;
  } catch {
    return null;
  }
}

export class EscrowService {
  /** In-memory fallback for unit tests using non-UUID order identifiers */
  private static _testStore: Map<string, EscrowAccount> = new Map();

  private static useDatabase(orderId: string): boolean {
    return isUuid(orderId);
  }

  private static buildAccountFromDb(
    order: {
      id: string;
      orderNumber: string;
      totalAmount: { toNumber?: () => number } | number;
      escrowStatus: EscrowState;
      status: OrderStatus;
    },
    metadata: EscrowMetadata,
    ledgerRows: Array<{ id: string; amount: { toNumber?: () => number } | number; type: string; reference: string; createdAt: Date }>,
  ): EscrowAccount {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: Number(order.totalAmount),
      currency: "PKR",
      status: metadata.lifecycleStatus,
      supplierId: metadata.supplierId,
      supplierTier: metadata.supplierTier,
      supplierReleaseAmount: metadata.supplierReleaseAmount,
      platformCommissionAmount: metadata.platformCommissionAmount,
      fundedAt: metadata.fundedAt ? new Date(metadata.fundedAt) : undefined,
      releasedAt: metadata.releasedAt ? new Date(metadata.releasedAt) : undefined,
      refundedAt: metadata.refundedAt ? new Date(metadata.refundedAt) : undefined,
      ledger: ledgerRows.map((row) => ({
        id: row.id,
        type: LEDGER_TYPE_MAP[row.type] || "HOLD_DEPOSIT",
        amount: Number(row.amount),
        reference: row.reference,
        timestamp: row.createdAt,
      })),
    };
  }

  static async createEscrow(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
    supplierId: string;
    supplierTier?: SupplierTier;
    monthlyGMV?: number;
  }): Promise<EscrowAccount> {
    const tier = params.supplierTier || "GOLD_FACTORY";
    const commission = CommissionService.calculateCommission({
      orderAmount: params.amount,
      supplierTier: tier,
      monthlyGMV: params.monthlyGMV,
    });

    if (!this.useDatabase(params.orderId)) {
      const account: EscrowAccount = {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        totalAmount: params.amount,
        currency: "PKR",
        status: "CREATED",
        supplierId: params.supplierId,
        supplierTier: tier,
        supplierReleaseAmount: commission.supplierPayout,
        platformCommissionAmount: commission.platformFee,
        ledger: [],
      };
      this._testStore.set(params.orderId, account);
      return account;
    }

    const order = await prisma.order.findUnique({ where: { id: params.orderId } });
    if (!order) {
      throw new Error(`Order ${params.orderId} not found`);
    }

    const metadata: EscrowMetadata = {
      lifecycleStatus: "CREATED",
      supplierId: params.supplierId,
      supplierTier: tier,
      supplierReleaseAmount: commission.supplierPayout,
      platformCommissionAmount: commission.platformFee,
    };

    await prisma.escrowLedger.create({
      data: {
        orderId: params.orderId,
        amount: params.amount,
        type: "ESCROW_INIT",
        reference: JSON.stringify(metadata),
      },
    });

    return this.buildAccountFromDb(order, metadata, []);
  }

  static async getEscrow(orderId: string): Promise<EscrowAccount | null> {
    if (!this.useDatabase(orderId)) {
      return this._testStore.get(orderId) || null;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrowLedger: { orderBy: { createdAt: "asc" } } },
    });
    if (!order) return null;

    const initRow = order.escrowLedger.find((row) => row.type === "ESCROW_INIT");
    const metadata = initRow ? parseMetadata(initRow.reference) : null;
    if (!metadata) return null;

    const financialLedger = order.escrowLedger.filter((row) => row.type !== "ESCROW_INIT");
    return this.buildAccountFromDb(order, metadata, financialLedger);
  }

  static async transitionState(
    orderId: string,
    targetState: EscrowLifecycleState,
    meta?: { reference?: string },
  ): Promise<EscrowAccount> {
    if (!this.useDatabase(orderId)) {
      const account = this._testStore.get(orderId);
      if (!account) {
        throw new Error(`Escrow account for order ${orderId} not found`);
      }

      const nextState = EscrowStateMachine.transition(account.status, targetState);
      account.status = nextState;

      if (nextState === "FUNDED") {
        account.fundedAt = new Date();
        account.ledger.push({
          id: `LEDGER-${crypto.randomBytes(6).toString("hex")}`,
          type: "HOLD_DEPOSIT",
          amount: account.totalAmount,
          reference: meta?.reference || `ESCROW_LOCK_${account.orderNumber}`,
          timestamp: new Date(),
        });
      } else if (nextState === "RELEASED") {
        account.releasedAt = new Date();
        account.ledger.push(
          {
            id: `LEDGER-${crypto.randomBytes(6).toString("hex")}`,
            type: "SUPPLIER_PAYOUT",
            amount: account.supplierReleaseAmount,
            reference: `PAYOUT_TO_SUPPLIER_${account.supplierId}`,
            timestamp: new Date(),
          },
          {
            id: `LEDGER-${crypto.randomBytes(6).toString("hex")}`,
            type: "PLATFORM_COMMISSION",
            amount: account.platformCommissionAmount,
            reference: `COMMISSION_REV_${account.orderNumber}`,
            timestamp: new Date(),
          },
        );
      } else if (nextState === "REFUNDED") {
        account.refundedAt = new Date();
        account.ledger.push({
          id: `LEDGER-${crypto.randomBytes(6).toString("hex")}`,
          type: "BUYER_REFUND",
          amount: account.totalAmount,
          reference: meta?.reference || `ESCROW_REFUND_${account.orderNumber}`,
          timestamp: new Date(),
        });
      }

      this._testStore.set(orderId, account);
      return account;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrowLedger: { orderBy: { createdAt: "asc" } } },
    });
    if (!order) {
      throw new Error(`Escrow account for order ${orderId} not found`);
    }

    const initRow = order.escrowLedger.find((row) => row.type === "ESCROW_INIT");
    const metadata = initRow ? parseMetadata(initRow.reference) : null;
    if (!metadata) {
      throw new Error(`Escrow metadata for order ${orderId} not found`);
    }

    const nextState = EscrowStateMachine.transition(metadata.lifecycleStatus, targetState);
    metadata.lifecycleStatus = nextState;

    const ledgerEntries: Array<{ amount: number; type: string; reference: string }> = [];

    if (nextState === "FUNDED") {
      metadata.fundedAt = new Date().toISOString();
      ledgerEntries.push({
        amount: Number(order.totalAmount),
        type: "DEPOSIT_INTO_ESCROW",
        reference: meta?.reference || `ESCROW_LOCK_${order.orderNumber}`,
      });
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.ESCROW_FUNDED,
          escrowStatus: EscrowState.HELD_IN_ESCROW,
        },
      });
    } else if (nextState === "RELEASED") {
      metadata.releasedAt = new Date().toISOString();
      ledgerEntries.push(
        {
          amount: metadata.supplierReleaseAmount,
          type: "SUPPLIER_PAYOUT",
          reference: `PAYOUT_TO_SUPPLIER_${metadata.supplierId}`,
        },
        {
          amount: metadata.platformCommissionAmount,
          type: "PLATFORM_COMMISSION",
          reference: `COMMISSION_REV_${order.orderNumber}`,
        },
      );
      await prisma.order.update({
        where: { id: orderId },
        data: { escrowStatus: EscrowState.RELEASED_TO_SUPPLIER },
      });
    } else if (nextState === "REFUNDED") {
      metadata.refundedAt = new Date().toISOString();
      ledgerEntries.push({
        amount: Number(order.totalAmount),
        type: "BUYER_REFUND",
        reference: meta?.reference || `ESCROW_REFUND_${order.orderNumber}`,
      });
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          escrowStatus: EscrowState.REFUNDED_TO_BUYER,
        },
      });
    }

    if (initRow) {
      await prisma.escrowLedger.update({
        where: { id: initRow.id },
        data: { reference: JSON.stringify(metadata) },
      });
    }

    for (const entry of ledgerEntries) {
      await prisma.escrowLedger.create({
        data: {
          orderId,
          amount: entry.amount,
          type: entry.type,
          reference: entry.reference,
        },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrowLedger: { orderBy: { createdAt: "asc" } } },
    });
    if (!updatedOrder) {
      throw new Error(`Escrow account for order ${orderId} not found after transition`);
    }

    const financialLedger = updatedOrder.escrowLedger.filter((row) => row.type !== "ESCROW_INIT");
    return this.buildAccountFromDb(updatedOrder, metadata, financialLedger);
  }

  static clear(): void {
    this._testStore.clear();
  }
}
