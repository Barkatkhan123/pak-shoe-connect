import crypto from "crypto";

export interface CorrelationContext {
  id: string;
}

export function getOrCreateCorrelationId(headers: Headers | Record<string, string> | any): string {
  let correlationId: string | null = null;

  if (headers instanceof Headers) {
    correlationId = headers.get("x-correlation-id") || headers.get("X-Correlation-ID");
  } else if (headers && typeof headers === "object") {
    correlationId = headers["x-correlation-id"] || headers["X-Correlation-ID"];
  }

  return correlationId || crypto.randomUUID();
}
