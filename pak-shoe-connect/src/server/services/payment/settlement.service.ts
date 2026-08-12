import { SupplierWalletService, PayoutRequest } from "./supplier-wallet.service";

export interface SettlementBatch {
  batchId: string;
  totalPayoutAmount: number;
  payoutCount: number;
  status: "OPEN" | "PROCESSING" | "SETTLED";
  executedAt?: Date;
}

export class SettlementService {
  /**
   * Returns current supplier financial balance breakdown
   */
  static async getSupplierFinances(supplierId: string) {
    const wallet = await SupplierWalletService.getWallet(supplierId);
    return {
      supplierId,
      totalSales: wallet.totalWithdrawn + wallet.released + wallet.pendingEscrow,
      commissionPaid: Math.round((wallet.totalWithdrawn + wallet.released) * 0.03), // 3% Gold factory avg
      pendingEscrow: wallet.pendingEscrow,
      availableBalance: wallet.available,
      releasedBalance: wallet.released,
      bankAccounts: wallet.bankAccounts,
      recentPayouts: wallet.recentPayouts,
    };
  }

  /**
   * Submits a supplier payout / withdrawal request
   */
  static async createWithdrawal(params: {
    supplierId: string;
    amount: number;
    bankAccountIndex?: number;
  }): Promise<PayoutRequest> {
    return SupplierWalletService.requestWithdrawal(params);
  }
}
