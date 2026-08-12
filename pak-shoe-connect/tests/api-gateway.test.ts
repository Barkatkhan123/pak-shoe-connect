import { describe, it, expect } from "vitest";
import { apiGateway } from "../src/server/gateway/gateway";
import { signToken } from "../src/server/gateway/middleware/auth.middleware";

describe("Zero Trust API Gateway", () => {
  it("should attach correlation ID and security headers to all responses", async () => {
    const res = await apiGateway("/api/v1/health", "GET");
    expect(res.status).toBe(200);
    expect(res.headers["X-Correlation-Id"]).toMatch(/^REQ-[0-9A-F]+-[0-9A-F]+$/);
    expect(res.headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(res.headers["X-Frame-Options"]).toBe("DENY");
    expect(res.headers["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
  });

  it("should return DTO response and hide internal IDs / stack traces", async () => {
    const res = await apiGateway("/api/v1/health", "GET");
    expect(res.body.success).toBe(true);
    expect(res.body.correlationId).toBeDefined();
    expect(res.body.data.status).toBe("operational");
    // Ensure no internal details leaked
    expect(res.body.stack).toBeUndefined();
    expect(res.body.sql).toBeUndefined();
    expect(res.body.prisma).toBeUndefined();
  });

  it("should reject protected routes when unauthorized (no JWT token)", async () => {
    const res = await apiGateway("/api/v1/supplier/wallet", "GET");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
    expect(res.body.message).toBe("Authentication required");
  });

  it("should reject protected routes when user role is unauthorized (RBAC)", async () => {
    const buyerToken = signToken({ sub: "user-123", role: "BUYER" });
    const res = await apiGateway("/api/v1/admin/finance/revenue", "GET", {}, {}, {
      authorization: `Bearer ${buyerToken}`,
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("should allow authorized supplier to access supplier wallet and return sanitized DTO", async () => {
    const supplierToken = signToken({ sub: "supp-user-456", role: "SUPPLIER", supplierId: "SUPP-001" });
    const res = await apiGateway("/api/v1/supplier/wallet", "GET", {}, {}, {
      authorization: `Bearer ${supplierToken}`,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.availableBalance).toContain("PKR");
    expect(res.body.data.currency).toBe("PKR");
    // Verify sensitive internal fields are stripped (IBAN, raw walletId, etc.)
    expect(res.body.data.iban).toBeUndefined();
    expect(res.body.data.walletId).toBeUndefined();
    expect(res.body.data.supplierId).toBeUndefined();
  });

  it("should normalize 404 errors for non-existent routes without exposing available routes", async () => {
    const validToken = signToken({ sub: "user-123", role: "BUYER" });
    const res = await apiGateway("/api/v1/internal/secret-service", "GET", {}, {}, {
      authorization: `Bearer ${validToken}`,
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("NOT_FOUND");
    expect(res.body.message).toBe("The requested resource was not found.");
    expect(res.body.routes).toBeUndefined();
  });

  it("should rate limit rapid repeated requests on auth endpoints", async () => {
    const clientIp = "192.168.1.99";
    // Send 11 rapid requests (limit is 10)
    let lastRes;
    for (let i = 0; i < 11; i++) {
      lastRes = await apiGateway("/api/v1/auth/login", "POST", {
        phone: "+923001234567",
        password: "invalidpassword",
      }, {}, {}, clientIp);
    }
    expect(lastRes?.status).toBe(429);
    expect(lastRes?.body.code).toBe("RATE_LIMITED");
    expect(lastRes?.body.message).toBe("Too many requests. Please slow down.");
  });
});
