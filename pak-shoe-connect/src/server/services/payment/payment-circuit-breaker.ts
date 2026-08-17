import { SupportedPaymentProvider } from "./gateway.interface";
import { SecurityLogger } from "./security-logger";

/**
 * Payment Gateway Circuit Breaker & Failover System
 *
 * Tracks health metrics per payment provider (JazzCash, Easypaisa, PayFast).
 * If a provider accumulates 3 consecutive failures or timeouts within 60s,
 * the circuit switches to OPEN (DEGRADED) state and automatically routes
 * buyers to alternative healthy gateways.
 *
 * Circuit States:
 *   - CLOSED: Normal operation (100% traffic)
 *   - OPEN: Provider degraded, fallback suggested
 *   - HALF_OPEN: Trialing recovery after 30s cooldown
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface ProviderHealth {
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  cooldownUntil?: number;
}

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 30_000; // 30 seconds cooldown before testing recovery

export class PaymentCircuitBreaker {
  private static healthMap = new Map<SupportedPaymentProvider, ProviderHealth>();

  private static getHealth(provider: SupportedPaymentProvider): ProviderHealth {
    if (!this.healthMap.has(provider)) {
      this.healthMap.set(provider, {
        state: "CLOSED",
        consecutiveFailures: 0,
      });
    }
    return this.healthMap.get(provider)!;
  }

  /**
   * Checks if a provider is available to process transactions.
   * Handles HALF_OPEN state trial transitions.
   */
  static isAvailable(provider: SupportedPaymentProvider): boolean {
    const health = this.getHealth(provider);
    const now = Date.now();

    if (health.state === "CLOSED") {
      return true;
    }

    if (health.state === "OPEN") {
      if (health.cooldownUntil && now >= health.cooldownUntil) {
        health.state = "HALF_OPEN";
        SecurityLogger.info("CIRCUIT_BREAKER", `Circuit HALF_OPEN for provider ${provider}`, {
          provider,
        });
        return true;
      }
      return false; // Still in cooldown window
    }

    if (health.state === "HALF_OPEN") {
      return true; // Allow trial traffic
    }

    return true;
  }

  /**
   * Records a successful transaction — resets failure count and closes circuit.
   */
  static recordSuccess(provider: SupportedPaymentProvider): void {
    const health = this.getHealth(provider);
    health.consecutiveFailures = 0;
    health.lastSuccessTime = Date.now();

    if (health.state !== "CLOSED") {
      health.state = "CLOSED";
      SecurityLogger.info(
        "CIRCUIT_BREAKER",
        `Circuit CLOSED (Recovered) for provider ${provider}`,
        { provider },
      );
    }
  }

  /**
   * Records a failed attempt or timeout — trips circuit if threshold reached.
   */
  static recordFailure(provider: SupportedPaymentProvider, errorReason?: string): void {
    const health = this.getHealth(provider);
    const now = Date.now();

    health.consecutiveFailures += 1;
    health.lastFailureTime = now;

    if (health.consecutiveFailures >= FAILURE_THRESHOLD && health.state !== "OPEN") {
      health.state = "OPEN";
      health.cooldownUntil = now + COOLDOWN_MS;

      SecurityLogger.warn("CIRCUIT_BREAKER", `Circuit OPEN (Degraded) for provider ${provider}`, {
        provider,
        failures: health.consecutiveFailures,
        errorReason: errorReason || "Timeout or gateway error",
        cooldownMs: COOLDOWN_MS,
      });
    }
  }

  /**
   * Returns a fallback payment provider recommendation if the requested provider is degraded.
   */
  static getFallbackProvider(requested: SupportedPaymentProvider): SupportedPaymentProvider {
    if (this.isAvailable(requested)) {
      return requested;
    }

    // Priority fallback matrix
    const FALLBACK_MATRIX: Record<SupportedPaymentProvider, SupportedPaymentProvider[]> = {
      JAZZCASH: ["EASYPAISA", "PAYFAST", "DIRECT_BANK_TRANSFER"],
      EASYPAISA: ["JAZZCASH", "PAYFAST", "DIRECT_BANK_TRANSFER"],
      PAYFAST: ["JAZZCASH", "EASYPAISA", "DIRECT_BANK_TRANSFER"],
      DIRECT_BANK_TRANSFER: ["PAYFAST", "JAZZCASH"],
      STRIPE_INTERNATIONAL: ["DIRECT_BANK_TRANSFER"],
    };

    const alternatives = FALLBACK_MATRIX[requested] || [];
    for (const alt of alternatives) {
      if (this.isAvailable(alt)) {
        SecurityLogger.info(
          "CIRCUIT_BREAKER_FAILOVER",
          `Failing over from ${requested} to ${alt}`,
          {
            requested,
            fallback: alt,
          },
        );
        return alt;
      }
    }

    return "DIRECT_BANK_TRANSFER"; // Safe default fallback
  }

  /**
   * Returns full health metrics for all payment providers (for admin/monitoring APIs).
   */
  static getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    for (const [provider, health] of this.healthMap.entries()) {
      metrics[provider] = {
        state: health.state,
        consecutiveFailures: health.consecutiveFailures,
        available: this.isAvailable(provider),
      };
    }
    return metrics;
  }

  static clear(): void {
    this.healthMap.clear();
  }
}
