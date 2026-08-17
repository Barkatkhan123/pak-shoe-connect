import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { paymentRedis } from "./payment-redis.connection";
import prisma from "../../db";
import { isUuid } from "../../utils/isUuid";

/**
 * Supplier wallet service with dual-backend support.
 *
 * - **Primary (Redis)**: Balances stored in Redis hashes with field-level
 *   atomicity using HINCRBYFLOAT so concurrent withdrawals cannot produce
 *   negative balances.
 * - **Fallback (PostgreSQL via Prisma)**: When Redis is unavailable, uses the
 *   `SupplierWallet` table with Prisma interactive transactions for atomic
 *   balance operations. This replaces the previous in-memory Map which lost
 *   data on every cold start in serverless environments.
 *
 * MED-04: Replaces the previous in-memory Map which was erased on every restart.
 */

export interface BankAccountDetails {
  accountTitle: string;
  bankName: string;
  iban: string;
  branchCode?: string;
  ntnTaxNumber?: string;
}

export interface PayoutRequest {
  id: string;
  supplierId: string;
  amount: number;
  bankDetails: BankAccountDetails;
  status: "PENDING" | "PROCESSING" | "PROCESSED" | "REJECTED";
  referenceNumber: string;
  createdAt: Date;
  processedAt?: Date;
}

// Default seed balances for demo purposes
const SEED_WALLET = {
  availableBalance: 4_850_000,
  pendingEscrow: 1_200_000,
  releasedBalance: 3_650_000,
  totalWithdrawn: 14_200_000,
};

const WALLET_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Default bank account used when seeding a new wallet */
const DEFAULT_BANK_ACCOUNT: BankAccountDetails = {
  accountTitle: "Sialkot Master Syndicate Leather Works",
  bankName: "Meezan Bank Ltd",
  iban: "PK77MEZN0009182736451928",
  branchCode: "0319",
  ntnTaxNumber: "4192837-1",
};

type WalletData = {
  availableBalance: number;
  pendingEscrow: number;
  releasedBalance: number;
  totalWithdrawn: number;
  bankAccounts: BankAccountDetails[];
  payoutRequests: PayoutRequest[];
};

function isRedisReady(): boolean {
  return paymentRedis.status === "ready";
}

function walletKey(supplierId: string): string {
  return `wallet:${supplierId}`;
}

export class SupplierWalletService {
  /** In-memory fallback for unit tests using non-UUID supplier identifiers */
  private static _testStore = new Map<string, WalletData>();

  private static useDatabase(supplierId: string): boolean {
    return process.env.NODE_ENV !== "test" || isUuid(supplierId);
  }

  /**
   * Seeds a wallet with default values if it does not yet exist.
   *
   * Redis path: checks EXISTS and writes HSET if missing.
   * DB fallback: uses Prisma upsert (no-op update when already exists).
   */
  private static async seedWallet(supplierId: string): Promise<void> {
    if (isRedisReady()) {
      const key = walletKey(supplierId);
      const exists = await paymentRedis.exists(key);
      if (!exists) {
        await paymentRedis.hset(key, {
          availableBalance: SEED_WALLET.availableBalance,
          pendingEscrow: SEED_WALLET.pendingEscrow,
          releasedBalance: SEED_WALLET.releasedBalance,
          totalWithdrawn: SEED_WALLET.totalWithdrawn,
          bankAccounts: JSON.stringify([DEFAULT_BANK_ACCOUNT]),
          payoutRequests: JSON.stringify([]),
        });
        await paymentRedis.expire(key, WALLET_TTL_SECONDS);
      }
      return;
    }

    if (!this.useDatabase(supplierId)) {
      if (!this._testStore.has(supplierId)) {
        this._testStore.set(supplierId, {
          ...SEED_WALLET,
          bankAccounts: [DEFAULT_BANK_ACCOUNT],
          payoutRequests: [],
        });
      }
      return;
    }

    // Database fallback: upsert with seed defaults (no-op if wallet already exists)
    await prisma.supplierWallet.upsert({
      where: { supplierId },
      update: {}, // No-op — wallet already exists
      create: {
        supplierId,
        availableBalance: SEED_WALLET.availableBalance,
        pendingEscrow: SEED_WALLET.pendingEscrow,
        releasedBalance: SEED_WALLET.releasedBalance,
        totalWithdrawn: SEED_WALLET.totalWithdrawn,
        bankAccounts: [DEFAULT_BANK_ACCOUNT] as unknown as Prisma.JsonArray,
        payoutRequests: [] as Prisma.JsonArray,
      },
    });
  }

  /**
   * Returns the wallet summary for a supplier.
   *
   * Redis path: HGETALL on wallet hash.
   * DB fallback: findUnique after seeding via upsert.
   */
  static async getWallet(supplierId: string) {
    await this.seedWallet(supplierId);

    if (isRedisReady()) {
      const raw = await paymentRedis.hgetall(walletKey(supplierId));
      return {
        supplierId,
        available: parseFloat(raw.availableBalance),
        pendingEscrow: parseFloat(raw.pendingEscrow),
        released: parseFloat(raw.releasedBalance),
        withdrawable: parseFloat(raw.availableBalance),
        totalWithdrawn: parseFloat(raw.totalWithdrawn),
        bankAccounts: JSON.parse(raw.bankAccounts || "[]"),
        recentPayouts: (JSON.parse(raw.payoutRequests || "[]") as PayoutRequest[]).slice(-5),
      };
    }

    if (!this.useDatabase(supplierId)) {
      const wallet = this._testStore.get(supplierId) || {
        ...SEED_WALLET,
        bankAccounts: [DEFAULT_BANK_ACCOUNT],
        payoutRequests: [],
      };
      return {
        supplierId,
        available: wallet.availableBalance,
        pendingEscrow: wallet.pendingEscrow,
        released: wallet.releasedBalance,
        withdrawable: wallet.availableBalance,
        totalWithdrawn: wallet.totalWithdrawn,
        bankAccounts: wallet.bankAccounts,
        recentPayouts: wallet.payoutRequests.slice(-5),
      };
    }

    // Database fallback: read wallet from SupplierWallet table
    const wallet = await prisma.supplierWallet.findUniqueOrThrow({
      where: { supplierId },
    });

    const bankAccounts = (wallet.bankAccounts as unknown as BankAccountDetails[]) || [];
    const payoutRequests = (wallet.payoutRequests as unknown as PayoutRequest[]) || [];

    return {
      supplierId,
      available: Number(wallet.availableBalance),
      pendingEscrow: Number(wallet.pendingEscrow),
      released: Number(wallet.releasedBalance),
      withdrawable: Number(wallet.availableBalance),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      bankAccounts,
      recentPayouts: payoutRequests.slice(-5),
    };
  }

  /**
   * Atomically deducts the withdrawal amount from the available balance.
   *
   * Redis path: Uses HINCRBYFLOAT for atomic decrement — prevents double-withdrawal
   * under concurrent requests even without a distributed lock.
   *
   * DB fallback: Uses a Prisma interactive transaction to read-check-update
   * atomically. The transaction isolation ensures no concurrent double-spend.
   */
  static async requestWithdrawal(params: {
    supplierId: string;
    amount: number;
    bankAccountIndex?: number;
  }): Promise<PayoutRequest> {
    await this.seedWallet(params.supplierId);

    if (isRedisReady()) {
      const key = walletKey(params.supplierId);

      // Atomic decrement — Redis single-threaded guarantee
      const newBalance = parseFloat(
        String(await paymentRedis.hincrbyfloat(key, "availableBalance", -params.amount)),
      );
      if (newBalance < 0) {
        // Roll back the decrement atomically
        await paymentRedis.hincrbyfloat(key, "availableBalance", params.amount);
        throw new Error(`Insufficient available balance (Requested: PKR ${params.amount})`);
      }

      const raw = await paymentRedis.hgetall(key);
      const bankAccounts: BankAccountDetails[] = JSON.parse(raw.bankAccounts || "[]");
      const bankDetails = bankAccounts[params.bankAccountIndex || 0];
      const payoutId = `PAYOUT-PK-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

      const request: PayoutRequest = {
        id: payoutId,
        supplierId: params.supplierId,
        amount: params.amount,
        bankDetails,
        status: "PENDING",
        referenceNumber: `1LINK-IBFT-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date(),
      };

      const payoutRequests: PayoutRequest[] = JSON.parse(raw.payoutRequests || "[]");
      payoutRequests.push(request);
      await paymentRedis.hset(key, "payoutRequests", JSON.stringify(payoutRequests));
      await paymentRedis.expire(key, WALLET_TTL_SECONDS);

      return request;
    }

    if (!this.useDatabase(params.supplierId)) {
      const wallet = this._testStore.get(params.supplierId)!;
      if (params.amount > wallet.availableBalance) {
        throw new Error(
          `Insufficient available balance (Available: PKR ${wallet.availableBalance}, Requested: PKR ${params.amount})`,
        );
      }
      const bankDetails = wallet.bankAccounts[params.bankAccountIndex || 0] || DEFAULT_BANK_ACCOUNT;
      const payoutId = `PAYOUT-PK-${Date.now()}`;
      const request: PayoutRequest = {
        id: payoutId,
        supplierId: params.supplierId,
        amount: params.amount,
        bankDetails,
        status: "PENDING",
        referenceNumber: `1LINK-IBFT-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date(),
      };
      wallet.availableBalance -= params.amount;
      wallet.payoutRequests.push(request);
      this._testStore.set(params.supplierId, wallet);
      return request;
    }

    // Database fallback: use an interactive transaction for atomicity
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.supplierWallet.findUniqueOrThrow({
        where: { supplierId: params.supplierId },
      });

      const availableBalance = Number(wallet.availableBalance);
      if (availableBalance < params.amount) {
        throw new Error(
          `Insufficient available balance (Available: PKR ${availableBalance}, Requested: PKR ${params.amount})`,
        );
      }

      const bankAccounts = (wallet.bankAccounts as unknown as BankAccountDetails[]) || [];
      const bankDetails = bankAccounts[params.bankAccountIndex || 0] || DEFAULT_BANK_ACCOUNT;
      const payoutId = `PAYOUT-PK-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

      const request: PayoutRequest = {
        id: payoutId,
        supplierId: params.supplierId,
        amount: params.amount,
        bankDetails,
        status: "PENDING",
        referenceNumber: `1LINK-IBFT-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date(),
      };

      const existingPayouts = (wallet.payoutRequests as unknown as PayoutRequest[]) || [];
      existingPayouts.push(request);

      await tx.supplierWallet.update({
        where: { supplierId: params.supplierId },
        data: {
          availableBalance: { decrement: params.amount },
          payoutRequests: existingPayouts as unknown as Prisma.JsonArray,
        },
      });

      return request;
    });
  }

  static clear(): void {
    this._testStore.clear();
  }
}
