import { describe, it, expect } from "vitest";
import { apiGateway } from "../src/server/gateway/gateway";
import { signToken } from "../src/server/gateway/middleware/auth.middleware";

describe("Zero Trust Gateway Route Coverage & Audit Safeguards", () => {
  it("should deny access to protected supplier endpoints without valid authorization", async () => {
    const res = await apiGateway("/api/v1/supplier/wallet", "GET");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("should deny access to protected admin endpoints for non-admin users", async () => {
    const res = await apiGateway("/api/v1/admin/audit-logs", "GET");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });

  it("should return sanitized error response with correlation ID on invalid routes for authenticated users", async () => {
    const validToken = signToken({ sub: "user-123", role: "BUYER" });
    const res = await apiGateway("/api/v1/unknown-endpoint-path", "GET", {}, {}, {
      authorization: `Bearer ${validToken}`,
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("NOT_FOUND");
    expect(res.headers["X-Correlation-Id"]).toBeDefined();
  });
});
