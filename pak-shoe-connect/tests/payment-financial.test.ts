import { describe, it, expect, beforeEach, vi } from "vitest";
import crypto from "crypto";
import { PaymentGatewayFactory } from "../src/server/services/payment/payment.gateway.factory";
import { PaymentService } from "../src/server/services/payment/payment.service";
import { PaymentIntentService } from "../src/server/services/payment/payment-intent.service";
import { PaymentWebhookHandler } from "../src/server/services/payment/payment.webhook";
import { CommissionService } from "../src/server/services/payment/commission.service";
import { EscrowStateMachine } from "../src/server/services/payment/escrow-state-machine";
import { EscrowService } from "../src/server/services/payment/escrow.service";
import { SupplierWalletService } from "../src/server/services/payment/supplier-wallet.service";
import { SettlementService } from "../src/server/services/payment/settlement.service";
import { InvoiceService } from "../src/server/services/payment/invoice.service";
import { FinanceAnalyticsService } from "../src/server/services/payment/finance-analytics.service";
import { IdempotencyService } from "../src/server/services/payment/idempotency.service";
import { handleApiRequest } from "../src/server/routes/api.router";
import { requireEnv } from "../src/server/utils/env";

describe("Step 8: Payment Gateway Integration & Financial Subsystem Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    IdempotencyService.clear();
    PaymentIntentService.clear();
    EscrowService.clear();
    SupplierWalletService.clear();
  });

  // ── 1. PAYMENT GATEWAY FACTORY & PROVIDERS ──
  describe("Payment Gateways & Providers", () => {
    it("should instantiate the correct gateway implementation via factory", () => {
      const ep = PaymentGatewayFactory.getGateway("EASYPAISA");
      const jc = PaymentGatewayFactory.getGateway("JAZZCASH");
      const pf = PaymentGatewayFactory.getGateway("PAYFAST");
      const bank = PaymentGatewayFactory.getGateway("DIRECT_BANK_TRANSFER");

      expect(ep.providerName).toBe("EASYPAISA");
      expect(jc.providerName).toBe("JAZZCASH");
      expect(pf.providerName).toBe("PAYFAST");
      expect(bank.providerName).toBe("DIRECT_BANK_TRANSFER");
    });

    it("should throw for unsupported payment gateways", () => {
      expect(() => {
        PaymentGatewayFactory.getGateway("UNSUPPORTED_PROVIDER");
      }).toThrow(/Unsupported payment provider/);
    });

    it("should generate redirect sessions and tokens for Easypaisa & JazzCash", async () => {
      const ep = PaymentGatewayFactory.getGateway("EASYPAISA");
      const session = await ep.createPayment({
        orderId: "ord-ep-001",
        orderNumber: "SHR-ORD-2026-001",
        amount: 500000,
      });

      expect(session.success).toBe(true);
      expect(session.gatewayTransactionId).toContain("EP-TX-");
      expect(session.redirectUrl).toContain("easypay.easypaisa.com.pk");

      const jc = PaymentGatewayFactory.getGateway("JAZZCASH");
      const jcSession = await jc.createPayment({
        orderId: "ord-jc-001",
        orderNumber: "SHR-ORD-2026-002",
        amount: 850000,
        paymentMethodType: "VOUCHER_OTC",
      });

      expect(jcSession.success).toBe(true);
      expect(jcSession.voucherCode).toContain("JC-VOUCH-");
    });

    it("should generate 1Link B2B basket token and IBFT bank instructions", async () => {
      const pf = PaymentGatewayFactory.getGateway("PAYFAST");
      const pfSession = await pf.createPayment({
        orderId: "ord-pf-001",
        orderNumber: "SHR-ORD-2026-003",
        amount: 1200000,
      });

      expect(pfSession.success).toBe(true);
      expect(pfSession.voucherCode).toContain("1LINK-KUICK-");

      const bank = PaymentGatewayFactory.getGateway("DIRECT_BANK_TRANSFER");
      const bankSession = await bank.createPayment({
        orderId: "ord-bank-001",
        orderNumber: "SHR-ORD-2026-004",
        amount: 3500000,
      });

      expect(bankSession.gatewayTransactionId).toContain("SHR-BANK-");
      expect(bankSession.rawResponse.iban).toContain("PK42MEZN");
    });
  });

  // ── 2. PAYMENT INTENT & ORCHESTRATION LAYER ──
  describe("Payment Intent & Pre-transaction Checkout", () => {
    it("should create payment intent with client secret and prevent checkout collision", async () => {
      const intent = await PaymentIntentService.createIntent({
        orderId: "ord-intent-001",
        orderNumber: "SHR-ORD-2026-005",
        amount: 669450,
        provider: "JAZZCASH",
        customerPhone: "+923001234567",
      });

      expect(intent.id).toContain("PI-");
      expect(intent.clientSecret).toContain("pi_sec_");
      expect(intent.status).toBe("PROCESSING");
      expect(intent.amount).toBe(669450);

      const retrieved = await PaymentIntentService.getIntent(intent.id);
      expect(retrieved?.id).toBe(intent.id);
    });

    it("should orchestrate payment initiation with Escrow in PAYMENT_PENDING state", async () => {
      const res = await PaymentService.initiatePayment({
        orderId: "ord-orch-001",
        orderNumber: "SHR-ORD-2026-006",
        amount: 1000000,
        provider: "PAYFAST",
        supplierId: "SUPP-SIALKOT-01",
        supplierTier: "GOLD_FACTORY",
      });

      expect(res.success).toBe(true);
      expect(res.intentId).toBeDefined();

      const escrow = await EscrowService.getEscrow("ord-orch-001");
      expect(escrow?.status).toBe("PAYMENT_PENDING");
      expect(escrow?.supplierReleaseAmount).toBe(970000); // 3% fee for Gold Factory
      expect(escrow?.platformCommissionAmount).toBe(30000);
    });

    it("should verify payment and capture funds to escrow", async () => {
      await EscrowService.createEscrow({
        orderId: "ord-verify-001",
        orderNumber: "SHR-ORD-2026-008",
        amount: 450000,
        supplierId: "SUPP-001",
      });
      await EscrowService.transitionState("ord-verify-001", "PAYMENT_PENDING");

      const verifyRes = await PaymentService.verifyAndCapture({
        provider: "EASYPAISA",
        transactionId: "EP-TX-SUCCESS-99",
        orderId: "ord-verify-001",
      });

      expect(verifyRes.verified).toBe(true);
      expect(verifyRes.status).toBe("SUCCESS");

      const escrow = await EscrowService.getEscrow("ord-verify-001");
      expect(escrow?.status).toBe("FUNDED");
    });

    it("should process buyer refund and record ledger entry", async () => {
      await EscrowService.createEscrow({
        orderId: "ord-refund-001",
        orderNumber: "SHR-ORD-2026-009",
        amount: 250000,
        supplierId: "SUPP-001",
      });
      await EscrowService.transitionState("ord-refund-001", "PAYMENT_PENDING");
      await EscrowService.transitionState("ord-refund-001", "FUNDED");

      const refundResult = await PaymentService.processRefund({
        provider: "JAZZCASH",
        transactionId: "JC-TX-112233",
        orderId: "ord-refund-001",
        amount: 250000,
        reason: "Buyer cancelled before factory production",
      });

      expect(refundResult.success).toBe(true);
      expect(refundResult.refundTransactionId).toContain("JC-REF-");

      const escrow = await EscrowService.getEscrow("ord-refund-001");
      expect(escrow?.status).toBe("REFUNDED");
      expect(escrow?.ledger.some((l) => l.type === "BUYER_REFUND")).toBe(true);
    });
  });

  // ── 3. WEBHOOK SECURITY & IDEMPOTENCY ──
  describe("Webhook Security & Idempotency Deduplication", () => {
    it("should verify webhook signature and reject unauthorized signatures", async () => {
      const ep = PaymentGatewayFactory.getGateway("EASYPAISA");
      const testPayload = { amount: 500 };

      // Compute a real HMAC-SHA256 signature using the test env key
      const testKey = requireEnv("EASYPAISA_HASH_KEY");
      const bodyString = JSON.stringify(testPayload);
      const validSigHex = crypto.createHmac("sha256", testKey).update(bodyString).digest("hex");

      const validSig = ep.verifyWebhookSignature(validSigHex, testPayload);
      const invalidSig = ep.verifyWebhookSignature("badf00d1badf00d1badf00d1badf00d1badf00d1badf00d1badf00d1badf00d1", testPayload);

      expect(validSig).toBe(true);    // Real computed HMAC must pass
      expect(invalidSig).toBe(false); // Tampered signature must be rejected
    });

    it("should handle webhook callbacks and ignore duplicates idempotently", async () => {
      const testPayload = {
        transactionId: "EP-TX-882190",
        orderId: "SHR-ORD-2026-9901",
        amount: 669450,
      };

      // Generate a real HMAC signature for this payload
      const testKey = requireEnv("EASYPAISA_HASH_KEY");
      const realSig = crypto.createHmac("sha256", testKey).update(JSON.stringify(testPayload)).digest("hex");

      // First webhook callback
      const res1 = await PaymentWebhookHandler.handleWebhook({
        provider: "EASYPAISA",
        signature: realSig,
        payload: testPayload,
      });

      expect(res1.success).toBe(true);
      expect(res1.gatewayStatus).toBe("SUCCESS");

      // Duplicate webhook callback replay — same signature, same payload
      const res2 = await PaymentWebhookHandler.handleWebhook({
        provider: "EASYPAISA",
        signature: realSig,
        payload: testPayload,
      });

      expect(res2.success).toBe(true);
      expect(res2.cached).toBe(true);
      expect(res2.message).toContain("Idempotent");
    });
  });

  // ── 4. COMMISSION ENGINE ──
  describe("Tiered Marketplace Commission Engine", () => {
    it("should calculate 5% platform fee for FREE_STARTER suppliers", () => {
      const result = CommissionService.calculateCommission({
        orderAmount: 1000000,
        supplierTier: "FREE_STARTER",
      });

      expect(result.baseRatePercent).toBe(5.0);
      expect(result.effectiveRatePercent).toBe(5.0);
      expect(result.platformFee).toBe(50000);
      expect(result.supplierPayout).toBe(950000);
    });

    it("should calculate 4% platform fee for SILVER_MANUFACTURER suppliers", () => {
      const result = CommissionService.calculateCommission({
        orderAmount: 1000000,
        supplierTier: "SILVER_MANUFACTURER",
      });

      expect(result.baseRatePercent).toBe(4.0);
      expect(result.effectiveRatePercent).toBe(4.0);
      expect(result.platformFee).toBe(40000);
      expect(result.supplierPayout).toBe(960000);
    });

    it("should calculate 3% for GOLD_FACTORY and apply 0.5% discount for GMV > 5M", () => {
      const result = CommissionService.calculateCommission({
        orderAmount: 2000000,
        supplierTier: "GOLD_FACTORY",
        monthlyGMV: 6500000,
      });

      expect(result.baseRatePercent).toBe(3.0);
      expect(result.volumeDiscountPercent).toBe(0.5);
      expect(result.effectiveRatePercent).toBe(2.5);
      expect(result.platformFee).toBe(50000); // 2.5% of 2M
      expect(result.supplierPayout).toBe(1950000);
    });

    it("should apply export discount incentive when order is flagged as export", () => {
      const result = CommissionService.calculateCommission({
        orderAmount: 4000000,
        supplierTier: "GOLD_FACTORY",
        isExportOrder: true,
      });

      expect(result.volumeDiscountPercent).toBe(0.25);
      expect(result.effectiveRatePercent).toBe(2.75);
      expect(result.platformFee).toBe(110000);
    });
  });

  // ── 5. ESCROW STATE MACHINE & TRANSITIONS ──
  describe("Escrow State Machine Lifecycle", () => {
    it("should advance smoothly through valid forward milestones", () => {
      expect(EscrowStateMachine.isValidTransition("CREATED", "PAYMENT_PENDING")).toBe(true);
      expect(EscrowStateMachine.isValidTransition("PAYMENT_PENDING", "FUNDED")).toBe(true);
      expect(EscrowStateMachine.isValidTransition("FUNDED", "PRODUCTION_STARTED")).toBe(true);
      expect(EscrowStateMachine.isValidTransition("PRODUCTION_STARTED", "SHIPPED")).toBe(true);
      expect(EscrowStateMachine.isValidTransition("SHIPPED", "DELIVERED")).toBe(true);
      expect(EscrowStateMachine.isValidTransition("DELIVERED", "RELEASED")).toBe(true);
    });

    it("should throw error and block illegal jumps (e.g. PAYMENT_PENDING directly to RELEASED)", () => {
      expect(() => {
        EscrowStateMachine.transition("PAYMENT_PENDING", "RELEASED");
      }).toThrow(/Invalid escrow state transition/);
    });

    it("should record immutable ledger entries on FUNDED and RELEASED states", async () => {
      await EscrowService.createEscrow({
        orderId: "ord-escrow-full-01",
        orderNumber: "SHR-ORD-2026-007",
        amount: 500000,
        supplierId: "SUPP-001",
        supplierTier: "GOLD_FACTORY",
      });

      await EscrowService.transitionState("ord-escrow-full-01", "PAYMENT_PENDING");
      await EscrowService.transitionState("ord-escrow-full-01", "FUNDED");

      const fundedEscrow = await EscrowService.getEscrow("ord-escrow-full-01");
      expect(fundedEscrow?.status).toBe("FUNDED");
      expect(fundedEscrow?.ledger.some((l) => l.type === "HOLD_DEPOSIT")).toBe(true);

      await EscrowService.transitionState("ord-escrow-full-01", "PRODUCTION_STARTED");
      await EscrowService.transitionState("ord-escrow-full-01", "SHIPPED");
      await EscrowService.transitionState("ord-escrow-full-01", "DELIVERED");
      await EscrowService.transitionState("ord-escrow-full-01", "RELEASED");

      const releasedEscrow = await EscrowService.getEscrow("ord-escrow-full-01");
      expect(releasedEscrow?.status).toBe("RELEASED");
      expect(releasedEscrow?.ledger.some((l) => l.type === "SUPPLIER_PAYOUT")).toBe(true);
      expect(releasedEscrow?.ledger.some((l) => l.type === "PLATFORM_COMMISSION")).toBe(true);
    });
  });

  // ── 6. SUPPLIER WALLET & INVOICE GENERATION ──
  describe("Supplier Wallet, Settlement & B2B Tax Invoicing", () => {
    it("should return supplier financial wallet balances and process payout request", async () => {
      const finances = await SettlementService.getSupplierFinances("SUPP-001");

      expect(finances.availableBalance).toBe(4850000);
      expect(finances.pendingEscrow).toBe(1200000);
      expect(finances.releasedBalance).toBe(3650000);

      const payout = await SettlementService.createWithdrawal({
        supplierId: "SUPP-001",
        amount: 1000000,
      });

      expect(payout.status).toBe("PENDING");
      expect(payout.amount).toBe(1000000);
      expect(payout.referenceNumber).toContain("1LINK-IBFT-REF-");

      const updatedFinances = await SettlementService.getSupplierFinances("SUPP-001");
      expect(updatedFinances.availableBalance).toBe(3850000); // 4.85M - 1M
    });

    it("should reject withdrawal request when amount exceeds available balance", async () => {
      await expect(
        SettlementService.createWithdrawal({
          supplierId: "SUPP-001",
          amount: 999999999,
        })
      ).rejects.toThrow(/Insufficient available balance/);
    });

    it("should generate FBR GST-compliant B2B Wholesale Invoice with 18% tax and freight", () => {
      const invoice = InvoiceService.generateInvoice({
        orderNumber: "SHR-ORD-2026-0012",
        totalAmount: 4450000,
        totalPairs: 3000,
        totalCartons: 125,
        shippingCity: "Shah Alam Market, Lahore",
      });

      expect(invoice.invoiceNumber).toContain("INV-PK-2026-");
      expect(invoice.financials.gstRatePercent).toBe(18);
      expect(invoice.seller.ntnNumber).toBe("4192837-1");
      expect(invoice.buyer.ntnNumber).toBe("7829104-9");
      expect(invoice.status).toBe("PAID_VIA_ESCROW");
      expect(invoice.items[0].totalPairs).toBe(3000);
    });
  });

  // ── 7. FINANCIAL ANALYTICS & ADMIN RECONCILIATION ──
  describe("Financial Analytics & Reconciliation Engine", () => {
    it("should provide platform GMV revenue breakdown and 30-day transaction metrics", async () => {
      const revenue = await FinanceAnalyticsService.getRevenueOverview();
      expect(revenue.today).toBe(2500000);
      expect(revenue.month).toBe(48500000);
      expect(revenue.year).toBe(320000000);
      expect(revenue.platformCommission.year).toBe(11200000);

      const txAnalytics = await FinanceAnalyticsService.getTransactionAnalytics();
      expect(txAnalytics.paymentSuccessRate).toBeGreaterThan(95);
      expect(txAnalytics.gatewayPerformance.length).toBe(4);
      expect(txAnalytics.gatewayPerformance[0].gateway).toBe("1LINK_PAYFAST");
    });

    it("should report marketplace health KPIs and balanced 3-way reconciliation", async () => {
      const health = await FinanceAnalyticsService.getMarketplaceHealthMetrics();
      expect(health.gmv).toBe("320M PKR");
      expect(health.avgOrderValue).toBe(850000);
      expect(health.buyerRepeatRate).toBe(68.2);

      const recon = await FinanceAnalyticsService.getReconciliationReport();
      expect(recon.reconciliationStatus).toBe("BALANCED_RECONCILED");
      expect(recon.variance).toBe(0);
      expect(recon.matchedPercentage).toBe(100.0);
    });
  });

  // ── 8. API GATEWAY ROUTING ──
  describe("API Gateway Integration via handleApiRequest", () => {
    it("should route payment intent creation, status, and financial analytics endpoints", async () => {
      // 1. Create Payment Intent
      const intentRes = await handleApiRequest("/api/v1/payments/intent", "POST", {
        orderId: "ord-api-test-01",
        orderNumber: "SHR-ORD-2026-8812",
        amount: 850000,
        provider: "EASYPAISA",
      });

      expect(intentRes.status).toBe(200);
      expect(intentRes.data.intentId).toBeDefined();

      // 2. Fetch Status
      const statusRes = await handleApiRequest(
        `/api/v1/payments/${intentRes.data.intentId}/status`,
        "GET"
      );
      expect(statusRes.status).toBe(200);
      expect(statusRes.data.intent.orderNumber).toBe("SHR-ORD-2026-8812");

      // 3. Admin Revenue Overview
      const revRes = await handleApiRequest("/api/v1/admin/finance/revenue", "GET");
      expect(revRes.status).toBe(200);
      expect(revRes.data.month).toBe(48500000);

      // 4. Admin Reconciliation
      const reconRes = await handleApiRequest("/api/v1/admin/finance/reconciliation", "GET");
      expect(reconRes.status).toBe(200);
      expect(reconRes.data.reconciliationStatus).toBe("BALANCED_RECONCILED");

      // 5. Order Invoice
      const invRes = await handleApiRequest("/api/v1/orders/SHR-ORD-2026-0012/invoice", "GET");
      expect(invRes.status).toBe(200);
      expect(invRes.data.invoice.seller.ntnNumber).toBe("4192837-1");
    });
  });
});
