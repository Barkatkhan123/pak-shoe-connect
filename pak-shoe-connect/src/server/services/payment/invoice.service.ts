export interface InvoiceLineItem {
  description: string;
  cartonCount: number;
  pairsPerCarton: number;
  totalPairs: number;
  unitPrice: number;
  subtotal: number;
}

export interface B2BInvoice {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: Date;
  dueDate: Date;
  status: "PAID_VIA_ESCROW" | "PAYMENT_PENDING" | "REFUNDED";
  seller: {
    name: string;
    factoryTitle: string;
    ntnNumber: string;
    strnNumber: string;
    city: string;
    address: string;
  };
  buyer: {
    businessName: string;
    ntnNumber?: string;
    shippingCity: string;
    shippingAddress: string;
    contactPhone: string;
  };
  items: InvoiceLineItem[];
  financials: {
    subtotal: number;
    gstRatePercent: number;
    gstTaxAmount: number;
    freightCharges: number;
    grandTotal: number;
    currency: string;
  };
  paymentReference: {
    provider: string;
    transactionId: string;
    escrowStatus: string;
  };
}

export class InvoiceService {
  /**
   * Generates or fetches FBR-compliant B2B Wholesale Invoice
   */
  static generateInvoice(orderData: {
    orderNumber: string;
    totalAmount?: number;
    totalPairs?: number;
    totalCartons?: number;
    shippingCity?: string;
    shippingAddress?: string;
    freightAmount?: number;
    items?: Array<{
      title: string;
      cartons: number;
      pairs: number;
      unitPrice: number;
    }>;
    paymentTxId?: string;
    provider?: string;
  }): B2BInvoice {
    const rawSubtotal = orderData.totalAmount ? Math.round(orderData.totalAmount * 0.82) : 3_750_000;
    const gstRate = 18; // 18% standard GST in Pakistan
    const gstTax = Math.round((rawSubtotal * gstRate) / 100);
    const freight = orderData.freightAmount ?? 25_000;
    const grandTotal = rawSubtotal + gstTax + freight;

    return {
      invoiceNumber: `INV-PK-2026-${orderData.orderNumber.replace(/[^0-9]/g, "") || "0012"}`,
      orderNumber: orderData.orderNumber,
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "PAID_VIA_ESCROW",
      seller: {
        name: "Sialkot Master Syndicate Leather Footwear",
        factoryTitle: "Gold Certified OEM Manufacturer",
        ntnNumber: "4192837-1",
        strnNumber: "3277876123456",
        city: "Sialkot",
        address: "Small Industrial Estate, Daska Road, Sialkot, Punjab",
      },
      buyer: {
        businessName: "Khyber Wholesale Footwear Traders",
        ntnNumber: "7829104-9",
        shippingCity: orderData.shippingCity || "Shah Alam Market, Lahore",
        shippingAddress: orderData.shippingAddress || "Shop #44-48, Shoes Bazaar, Shah Alam Market, Lahore",
        contactPhone: "+92 300 8829102",
      },
      items: (orderData.items || [
        {
          title: "Charsadda Traditional Double-Sole Peshawari Chappal (Master Grade)",
          cartons: orderData.totalCartons || 125,
          pairs: orderData.totalPairs || 3000,
          unitPrice: 1250,
        },
      ]).map((it) => ({
        description: it.title,
        cartonCount: it.cartons,
        pairsPerCarton: 24,
        totalPairs: it.pairs,
        unitPrice: it.unitPrice,
        subtotal: it.pairs * it.unitPrice,
      })),
      financials: {
        subtotal: rawSubtotal,
        gstRatePercent: gstRate,
        gstTaxAmount: gstTax,
        freightCharges: freight,
        grandTotal,
        currency: "PKR",
      },
      paymentReference: {
        provider: orderData.provider || "1LINK_PAYFAST",
        transactionId: orderData.paymentTxId || "PF-1LINK-992819283",
        escrowStatus: "100% ESCROW_HELD",
      },
    };
  }
}
