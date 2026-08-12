import { PaymentGateway, SupportedPaymentProvider } from "./gateway.interface";
import { EasypaisaGateway } from "./easypaisa.gateway";
import { JazzCashGateway } from "./jazzcash.gateway";
import { PayFastGateway } from "./payfast.gateway";
import { BankTransferGateway } from "./bank.gateway";

export class PaymentGatewayFactory {
  private static gateways: Map<SupportedPaymentProvider, PaymentGateway> = new Map();

  static getGateway(provider: SupportedPaymentProvider | string): PaymentGateway {
    const normalized = provider.toUpperCase().replace(/-/g, "_") as SupportedPaymentProvider;

    if (this.gateways.has(normalized)) {
      return this.gateways.get(normalized)!;
    }

    let instance: PaymentGateway;

    switch (normalized) {
      case "EASYPAISA":
        instance = new EasypaisaGateway();
        break;
      case "JAZZCASH":
        instance = new JazzCashGateway();
        break;
      case "PAYFAST":
      case "ONE_LINK_PAYFAST" as any:
        instance = new PayFastGateway();
        break;
      case "DIRECT_BANK_TRANSFER":
      case "BANK_TRANSFER" as any:
        instance = new BankTransferGateway();
        break;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }

    this.gateways.set(normalized, instance);
    return instance;
  }
}
