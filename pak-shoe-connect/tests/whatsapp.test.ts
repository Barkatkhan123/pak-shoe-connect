import { describe, it, expect } from "vitest";
import { formatWhatsAppMessage } from "../src/server/workers/whatsapp.worker";

describe("WhatsApp Notification Engine & Localization", () => {
  it("should format bilingual Urdu/English RFQ notification for supplier factory", () => {
    const message = formatWhatsAppMessage({
      recipientPhone: "+923001234567",
      templateType: "RFQ_SUBMITTED_SUPPLIER_ALERT",
      payload: {
        userName: "Tariq Mahmood",
        rfqNumber: "RFQ-PK-2026-8812",
        productTitle: "Charsadda Traditional Double-Sole Chappal",
        quantity: 3000,
        actionUrl: "https://shersha.pk/supplier/quotes/RFQ-PK-2026-8812",
      },
    });

    expect(message).toContain("SHERSHA B2B");
    expect(message).toContain("Tariq Mahmood");
    expect(message).toContain("3,000 جوڑے");
    expect(message).toContain("125 کارٹن"); // ceil(3000/24)
    expect(message).toContain("RFQ-PK-2026-8812");
  });

  it("should format Escrow funded notification for supplier", () => {
    const message = formatWhatsAppMessage({
      recipientPhone: "+923001234567",
      templateType: "ORDER_ESCROW_FUNDED",
      payload: {
        userName: "Tariq Mahmood",
        orderNumber: "ORD-PK-2026-9901",
        amount: 669450,
      },
    });

    expect(message).toContain("100% محفوظ ایسکرو");
    expect(message).toContain("ORD-PK-2026-9901");
    expect(message).toContain("669,450");
  });

  it("should format Dispatch Bilti notification for buyer", () => {
    const message = formatWhatsAppMessage({
      recipientPhone: "+923009999999",
      templateType: "DISPATCH_TRACKING_ALERT",
      payload: {
        userName: "Usman Ghani",
        orderNumber: "ORD-PK-2026-9901",
        carrierName: "Faisal Movers Cargo B2B",
        biltiNumber: "BILTI-LHR-88219",
      },
    });

    expect(message).toContain("بِلٹی نمبر");
    expect(message).toContain("BILTI-LHR-88219");
    expect(message).toContain("Faisal Movers Cargo B2B");
  });
});
