/**
 * Structured security logger for the payment subsystem.
 *
 * Logs security-relevant events (signature checks, escrow transitions,
 * refusals, etc.) without ever exposing secret material in output.
 *
 * In production, replace the console.* calls with your log-shipping
 * pipeline (e.g. Datadog, CloudWatch, Elastic) by swapping the transport.
 */

export type SecurityEventLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface SecurityEvent {
  correlationId: string;
  level: SecurityEventLevel;
  event: string;
  provider?: string;
  transactionId?: string;
  orderId?: string;
  /** Never include raw secrets or full card/IBAN numbers here */
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}

export class SecurityLogger {
  static log(event: Omit<SecurityEvent, "timestamp">): void {
    const entry: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Sanitize: strip any field that looks like a secret
    if (entry.metadata) {
      for (const key of Object.keys(entry.metadata)) {
        if (/secret|key|salt|password|token|hash/i.test(key)) {
          entry.metadata[key] = "[REDACTED]";
        }
      }
    }

    const line = JSON.stringify(entry);

    switch (entry.level) {
      case "CRITICAL":
      case "ERROR":
        console.error(`[SECURITY] ${line}`);
        break;
      case "WARN":
        console.warn(`[SECURITY] ${line}`);
        break;
      default:
        console.info(`[SECURITY] ${line}`);
    }
  }

  static info(correlationId: string, event: string, metadata?: SecurityEvent["metadata"]): void {
    this.log({ correlationId, level: "INFO", event, metadata });
  }

  static warn(correlationId: string, event: string, metadata?: SecurityEvent["metadata"]): void {
    this.log({ correlationId, level: "WARN", event, metadata });
  }

  static critical(
    correlationId: string,
    event: string,
    metadata?: SecurityEvent["metadata"],
  ): void {
    this.log({ correlationId, level: "CRITICAL", event, metadata });
  }
}
