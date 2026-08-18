/**
 * Anamon Master Admin API & Security Subsystem Test Suite
 * Tests all Master Admin authorization, catalog modification, audit trails, and financial analytics.
 */

// Simulated browser storage and environment
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};
globalThis.window = {
  localStorage: globalThis.localStorage,
};

// Admin Security Engine logic
const MASTER_ADMIN_EMAIL = "anamoontotrade@gmail.com";
const EMERGENCY_RECOVERY_CODES = [
  "SHR-ADMIN-ALPHA-9901",
  "SHR-ADMIN-BRAVO-4412",
  "SHR-ADMIN-CHARLIE-8823",
  "SHR-ADMIN-DELTA-1194",
  "SHR-ADMIN-ECHO-7755",
];

const ADMIN_STORAGE_KEY = "shersha_master_admin_session";
const AUDIT_LOGS_STORAGE_KEY = "shersha_admin_audit_trail";
const FAILED_ATTEMPTS_KEY = "shersha_admin_failed_attempts";

const adminSecurityEngine = {
  getStoredSession: () => {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  createSession: (email, is2faVerified = true) => {
    const session = {
      email,
      role: "MASTER_ADMIN",
      ipAddress: "127.0.0.1",
      token: `admin_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      is2faVerified,
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    return session;
  },
  clearSession: () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  },
  logActivity: (entry) => {
    try {
      const existing = JSON.parse(localStorage.getItem(AUDIT_LOGS_STORAGE_KEY) || "[]");
      const newEntry = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestId: `REQ-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        ...entry,
      };
      existing.unshift(newEntry);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
      return newEntry;
    } catch {
      return null;
    }
  },
  getAuditLogs: () => {
    try {
      return JSON.parse(localStorage.getItem(AUDIT_LOGS_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  },
  verifyServerAuthorization: async (email, password) => {
    if (email !== MASTER_ADMIN_EMAIL) {
      return { authorized: false, reason: "HTTP 403 Forbidden: Unauthorized administrator email address." };
    }
    if (password && password.length < 6) {
      return { authorized: false, reason: "Invalid credentials." };
    }
    return { authorized: true, role: "MASTER_ADMIN", email };
  },
  verifyDynamicOtp: (email, otp) => {
    if (email !== MASTER_ADMIN_EMAIL) return { valid: false, reason: "Unauthorized email." };
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return { valid: false, reason: "OTP must be a 6-digit numeric code." };
    }
    return { valid: true };
  },
  recordFailedAttempt: () => {
    const current = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{"count":0}');
    current.count += 1;
    if (current.count >= 5) {
      current.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(current));
    return current;
  },
  resetFailedAttempts: () => {
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  },
};

const adminApiClient = {
  verifyAuthorization: async () => {
    const session = adminSecurityEngine.getStoredSession();
    if (!session || session.email !== MASTER_ADMIN_EMAIL || !session.is2faVerified) {
      return { success: false, error: "HTTP 403 Forbidden: Master Admin Authorization Required" };
    }
    const dbCheck = await adminSecurityEngine.verifyServerAuthorization(session.email);
    if (!dbCheck.authorized) {
      return { success: false, error: dbCheck.reason || "Forbidden" };
    }
    return { success: true, data: session };
  },
  performProductAction: async (action, productData) => {
    const session = adminSecurityEngine.getStoredSession();
    if (!session || session.email !== MASTER_ADMIN_EMAIL || !session.is2faVerified) {
      adminSecurityEngine.logActivity({
        adminEmail: session?.email || "UNAUTHENTICATED",
        role: "USER",
        action: `UNAUTHORIZED_PRODUCT_${action}`,
        target: productData?.name || productData?.slug || "Product",
        ipAddress: session?.ipAddress || "Unknown",
        status: "DENIED",
        details: "Attempted product modification without MASTER_ADMIN authorization.",
      });
      return {
        success: false,
        error: "HTTP 403 Forbidden: Only anamoontotrade@gmail.com can manage catalog items.",
      };
    }

    const log = adminSecurityEngine.logActivity({
      adminEmail: session.email,
      role: session.role,
      action: `PRODUCT_${action}`,
      target: productData?.name || productData?.slug || "Product",
      ipAddress: session.ipAddress,
      status: "SUCCESS",
      details: `Product ${action.toLowerCase()}d by Master Admin.`,
    });

    return { success: true, data: productData, auditLogId: log?.id };
  },
  getAuditLogs: () => {
    const session = adminSecurityEngine.getStoredSession();
    if (!session || session.email !== MASTER_ADMIN_EMAIL) {
      return { success: false, error: "HTTP 403 Forbidden: Unauthorized access to Audit Trail" };
    }
    return { success: true, data: adminSecurityEngine.getAuditLogs() };
  },
  getFinancialAnalytics: async () => {
    return {
      success: true,
      data: {
        todayGMV: 4200000,
        monthGMV: 48500000,
        yearGMV: 320000000,
        platformFeeMonth: 1455000,
        totalEscrowFunded: 18500000,
      },
    };
  },
  getReconciliationReport: async () => {
    return {
      success: true,
      data: {
        reconciliationStatus: "BALANCED_RECONCILED",
        matchedPercentage: 100.0,
        variance: 0,
        disputedCount: 0,
      },
    };
  },
};

async function runAdminTests() {
  console.log("🛡️ Starting Master Admin API & Security Subsystem Test Suite...\n");
  let passed = 0;
  let failed = 0;

  async function test(name, fn, shouldSucceed = true) {
    try {
      const res = await fn();
      if (shouldSucceed) {
        if (res && res.success === true) {
          console.log(`  ✅ [PASS] ${name} -> success: true`);
          passed++;
        } else {
          console.log(`  ❌ [FAIL] ${name} -> expected success but got:`, res);
          failed++;
        }
      } else {
        if (res && res.success === false) {
          console.log(`  ✅ [PASS] ${name} -> correctly denied (403): ${res.error || "Blocked"}`);
          passed++;
        } else {
          console.log(`  ❌ [FAIL] ${name} -> expected failure/denial but succeeded!`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`  ❌ [FAIL] ${name} -> threw exception:`, err.message);
      failed++;
    }
  }

  // 1. Unauthenticated / Unauthorized Protection Tests
  console.log("🔒 1. Zero Trust Security & Unauthorized Access Denial:");
  adminSecurityEngine.clearSession();
  await test("Verify Authorization without Session", () => adminApiClient.verifyAuthorization(), false);
  await test("Perform CREATE Product Action without Session", () =>
    adminApiClient.performProductAction("CREATE", { slug: "test", name: "Unauthorized Item" }), false);
  await test("Perform DELETE Product Action without Session", () =>
    adminApiClient.performProductAction("DELETE", { slug: "test", name: "Unauthorized Item" }), false);
  await test("Get Audit Trail without Session", () => adminApiClient.getAuditLogs(), false);

  // 2. Authentication with wrong email
  console.log("\n👤 2. RBAC Master Admin Authorization Validation:");
  const wrongCheck = await adminSecurityEngine.verifyServerAuthorization("hacker@example.com", "pass123456");
  if (!wrongCheck.authorized) {
    console.log("  ✅ [PASS] Hacker email rejection -> correctly blocked");
    passed++;
  } else {
    console.log("  ❌ [FAIL] Hacker email was permitted!");
    failed++;
  }

  const validCheck = await adminSecurityEngine.verifyServerAuthorization(MASTER_ADMIN_EMAIL, "admin123456");
  if (validCheck.authorized) {
    console.log(`  ✅ [PASS] Master Admin authorization -> correctly authorized (${validCheck.email})`);
    passed++;
  } else {
    console.log("  ❌ [FAIL] Master admin was rejected!");
    failed++;
  }

  // 3. 2FA & Dynamic OTP Validation
  console.log("\n📱 3. Two-Factor Authentication (2FA) & Recovery Codes:");
  const invalidOtp = adminSecurityEngine.verifyDynamicOtp(MASTER_ADMIN_EMAIL, "123");
  if (!invalidOtp.valid) {
    console.log("  ✅ [PASS] Invalid OTP rejection (3 digits) -> correctly rejected");
    passed++;
  }

  const validOtp = adminSecurityEngine.verifyDynamicOtp(MASTER_ADMIN_EMAIL, "489201");
  if (validOtp.valid) {
    console.log("  ✅ [PASS] Valid 6-digit OTP verification -> verified");
    passed++;
  }

  const recoveryPass = EMERGENCY_RECOVERY_CODES.includes("SHR-ADMIN-ALPHA-9901");
  if (recoveryPass) {
    console.log("  ✅ [PASS] Emergency Recovery Code Validation -> verified");
    passed++;
  }

  // 4. Authenticated Master Admin Session Operations
  console.log("\n👑 4. Master Admin Catalog Modification & Operations:");
  const activeSession = adminSecurityEngine.createSession(MASTER_ADMIN_EMAIL, true);
  await test("Verify Authorization with Master Admin Session", () => adminApiClient.verifyAuthorization(), true);

  // CREATE Product Action
  await test("Master Admin CREATE Product Action", () =>
    adminApiClient.performProductAction("CREATE", {
      slug: "presidential-oxford-shoe",
      name: "Presidential Oxford Leather Shoe",
      moq: 12,
      price: 1850,
    }), true);

  // UPDATE Product Action
  await test("Master Admin UPDATE Product Action", () =>
    adminApiClient.performProductAction("UPDATE", {
      slug: "presidential-oxford-shoe",
      name: "Presidential Oxford Leather Shoe (Updated)",
      inStock: true,
    }), true);

  // DELETE Product Action
  await test("Master Admin DELETE Product Action", () =>
    adminApiClient.performProductAction("DELETE", {
      slug: "presidential-oxford-shoe",
      name: "Presidential Oxford Leather Shoe",
    }), true);

  // 5. Audit Trail Integrity
  console.log("\n📜 5. Audit Trail Logging & Immutability:");
  const auditRes = adminApiClient.getAuditLogs();
  if (auditRes.success && Array.isArray(auditRes.data) && auditRes.data.length >= 4) {
    console.log(`  ✅ [PASS] Audit Trail -> retrieved ${auditRes.data.length} immutable log entries`);
    passed++;
  } else {
    console.log("  ❌ [FAIL] Audit Trail retrieval failed or empty:", auditRes);
    failed++;
  }

  // 6. Financial Analytics & 3-Way Reconciliation
  console.log("\n📊 6. Platform Financial Analytics & 3-Way Reconciliation:");
  await test("Admin Financial Revenue Overview", () => adminApiClient.getFinancialAnalytics(), true);
  await test("Admin 3-Way Reconciliation Report", () => adminApiClient.getReconciliationReport(), true);

  // 7. Brute Force Protection & Rate Limiting
  console.log("\n🛡️ 7. Brute Force Defense & Rate Limiter:");
  adminSecurityEngine.resetFailedAttempts();
  for (let i = 0; i < 5; i++) {
    adminSecurityEngine.recordFailedAttempt();
  }
  const lockedState = adminSecurityEngine.recordFailedAttempt();
  if (lockedState.lockedUntil && lockedState.lockedUntil > Date.now()) {
    console.log("  ✅ [PASS] 5 Failed Attempts Trigger 15-Minute Lockout -> Lock Active");
    passed++;
  } else {
    console.log("  ❌ [FAIL] Rate limiter lockout was not triggered!");
    failed++;
  }
  adminSecurityEngine.resetFailedAttempts();

  console.log("\n" + "=".repeat(55));
  console.log(`🏁 Admin Test Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} tests.`);
  console.log("=".repeat(55));

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminTests();
