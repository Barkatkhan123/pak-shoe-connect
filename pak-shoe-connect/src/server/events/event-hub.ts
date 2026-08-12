import { EventEmitter } from "events";

export type MarketplaceEventType =
  | "RFQ_RECEIVED"
  | "QUOTE_SUBMITTED"
  | "BUYER_ACCEPTED"
  | "PAYMENT_RELEASED"
  | "ORDER_DISPATCHED"
  | "INVENTORY_CHANGED";

export interface MarketplaceEventPayload {
  type: MarketplaceEventType;
  supplierId?: string;
  buyerId?: string;
  entityId: string;
  data: Record<string, any>;
  timestamp: string;
}

class MarketplaceEventHub extends EventEmitter {
  /**
   * Publish real-time event to connected Socket.IO/Redis PubSub clients
   */
  emitMarketplaceEvent(event: Omit<MarketplaceEventPayload, "timestamp">) {
    const fullPayload: MarketplaceEventPayload = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.emit(event.type, fullPayload);
    this.emit("*", fullPayload);

    console.log(`⚡ [RealTime EventHub] Emitted ${event.type} for entity ${event.entityId}`);
  }
}

export const eventHub = new MarketplaceEventHub();
