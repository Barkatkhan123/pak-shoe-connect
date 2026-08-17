import { describe, it, expect } from "vitest";
import { apiGateway } from "../src/server/gateway/gateway";
import { signToken } from "../src/server/gateway/middleware/auth.middleware";

describe("Admin Console & Marketplace Control Plane Security Suite", () => {
  const superAdminToken = signToken({ sub: "usr-superadmin-001", role: "SUPER_ADMIN" });
  const adminToken = signToken({ sub: "usr-admin-001", role: "ADMIN" });
  const operatorToken = signToken({ sub: "usr-operator-001", role: "OPERATOR" });
  const buyerToken = signToken({ sub: "usr-buyer-001", role: "BUYER" });

  it("should block non-admin users (BUYER) from accessing admin endpoints with 403 Forbidden", async () => {
    const res = await apiGateway(
      "/api/v1/admin/overview",
      "GET",
      {},
      {},
      {
        authorization: `Bearer ${buyerToken}`,
      },
    );
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("should allow ADMIN role to access admin overview metrics", async () => {
    const res = await apiGateway(
      "/api/v1/admin/overview",
      "GET",
      {},
      {},
      {
        authorization: `Bearer ${adminToken}`,
      },
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.totalGmv).toContain("PKR");
  });

  it("should restrict OPERATOR role from deleting products", async () => {
    const res = await apiGateway(
      "/api/v1/admin/products/prod-test-99",
      "DELETE",
      {},
      {},
      {
        authorization: `Bearer ${operatorToken}`,
      },
    );
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("should allow ADMIN role to approve pending products", async () => {
    const res = await apiGateway(
      "/api/v1/admin/products/prod-test-99/approve",
      "POST",
      {},
      {},
      {
        authorization: `Bearer ${adminToken}`,
      },
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("PUBLISHED");
  });

  it("should enforce Four-Eyes approval for financial payout overrides", async () => {
    // Admin initiates payout override
    const initRes = await apiGateway(
      "/api/v1/admin/finance/four-eyes/initiate",
      "POST",
      {
        amount: 1500000,
      },
      {},
      {
        authorization: `Bearer ${adminToken}`,
      },
    );
    expect(initRes.status).toBe(201);
    expect(initRes.body.data.status).toBe("AWAITING_SECOND_ADMIN_APPROVAL");

    // Standard ADMIN cannot give second approval — requires SUPER_ADMIN
    const adminApproveRes = await apiGateway(
      "/api/v1/admin/finance/four-eyes/approve",
      "POST",
      {
        requestId: initRes.body.data.requestId,
      },
      {},
      {
        authorization: `Bearer ${adminToken}`,
      },
    );
    expect(adminApproveRes.status).toBe(403);

    // SUPER_ADMIN successfully signs off second approval
    const superApproveRes = await apiGateway(
      "/api/v1/admin/finance/four-eyes/approve",
      "POST",
      {
        requestId: initRes.body.data.requestId,
      },
      {},
      {
        authorization: `Bearer ${superAdminToken}`,
      },
    );
    expect(superApproveRes.status).toBe(200);
    expect(superApproveRes.body.data.status).toBe("APPROVED_AND_EXECUTED");
  });

  it("should return system health telemetry including circuit breaker status", async () => {
    const res = await apiGateway(
      "/api/v1/admin/system/health",
      "GET",
      {},
      {},
      {
        authorization: `Bearer ${adminToken}`,
      },
    );
    expect(res.status).toBe(200);
    expect(res.body.data.gatewayStatus).toBe("HEALTHY");
    expect(res.body.data.redisConnection).toBe("CONNECTED");
    expect(res.body.data.circuitBreakers).toBeDefined();
  });
});
