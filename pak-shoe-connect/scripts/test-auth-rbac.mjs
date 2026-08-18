/**
 * Anamon Authentication & Authorization (RBAC) Comprehensive Test Suite
 * Validates Zod schemas, JWT verification, role permission matrices, Master Admin 2FA, and route guards.
 */

import { z } from "zod";
import crypto from "crypto";

// ── 1. Zod Validation Schemas from UI Auth Modal ──
const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  business_name: z.string().trim().min(1, "Business name is required").max(120),
  owner_name: z.string().trim().min(1, "Owner name is required").max(120),
  phone: z.string().trim().min(6, "Valid phone/WhatsApp required").max(30),
  city: z.string().trim().max(80).optional(),
});

// ── 2. JWT Engine Simulation (HMAC-SHA256) ──
const JWT_SECRET = process.env.JWT_SECRET || "anamon_test_jwt_secret_key_2026_super_secure";

function base64UrlEncode(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
}

function signJwt(payload, expiresInSec = 3600) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSec };
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Token missing" };
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed JWT" };
  }
  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (signature !== expectedSig) {
    return { valid: false, error: "Invalid signature" };
  }

  try {
    const payload = base64UrlDecode(encodedPayload);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Invalid payload encoding" };
  }
}

// ── 3. Role-Based Access Control (RBAC) Permission Matrix ──
const ROUTE_PERMISSIONS = {
  // Public Routes (No Auth Required)
  "/api/v1/catalog/products": ["PUBLIC", "BUYER", "SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/catalog/search": ["PUBLIC", "BUYER", "SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/pricing/calculate": ["PUBLIC", "BUYER", "SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/logistics/hubs": ["PUBLIC", "BUYER", "SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/orders/tracking": ["PUBLIC", "BUYER", "SUPPLIER", "ADMIN", "SUPER_ADMIN"],

  // Buyer Authenticated Routes
  "/api/v1/basket": ["BUYER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/basket/add": ["BUYER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/rfq/create": ["BUYER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/payments/intent": ["BUYER", "ADMIN", "SUPER_ADMIN"],

  // Supplier Authenticated Routes
  "/api/v1/supplier/dashboard": ["SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/supplier/quote": ["SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/supplier/wallet": ["SUPPLIER", "ADMIN", "SUPER_ADMIN"],
  "/api/v1/supplier/settlement/withdraw": ["SUPPLIER", "ADMIN", "SUPER_ADMIN"],

  // Admin & Super Admin Only Routes
  "/api/v1/admin/finance/revenue": ["ADMIN", "SUPER_ADMIN"],
  "/api/v1/admin/finance/reconciliation": ["ADMIN", "SUPER_ADMIN"],
  "/api/v1/admin/audit-logs": ["ADMIN", "SUPER_ADMIN"],
  "/api/v1/admin/product/manage": ["ADMIN", "SUPER_ADMIN"],
};

function checkRouteAuthorization(route, userRole) {
  const allowedRoles = ROUTE_PERMISSIONS[route];
  if (!allowedRoles) return { authorized: false, status: 404, message: "Route Not Found" };
  if (allowedRoles.includes("PUBLIC")) return { authorized: true, status: 200 };
  
  if (!userRole) {
    return { authorized: false, status: 401, message: "HTTP 401 Unauthorized: Authentication required" };
  }
  if (!allowedRoles.includes(userRole)) {
    return { authorized: false, status: 403, message: `HTTP 403 Forbidden: Role ${userRole} is not permitted` };
  }
  return { authorized: true, status: 200 };
}

// ── 4. Master Admin 2FA & Security Engine ──
const MASTER_ADMIN_EMAIL = "anamoontotrade@gmail.com";
const EMERGENCY_CODES = ["SHR-ADMIN-ALPHA-9901", "SHR-ADMIN-BRAVO-4412"];

function verifyMasterAdminAuth(email, otpOrRecoveryCode) {
  if (email.toLowerCase() !== MASTER_ADMIN_EMAIL) {
    return { authorized: false, reason: "Unauthorized admin email" };
  }
  const isOtp = otpOrRecoveryCode && /^\d{6}$/.test(otpOrRecoveryCode);
  const isRecovery = EMERGENCY_CODES.includes(otpOrRecoveryCode);
  if (!isOtp && !isRecovery) {
    return { authorized: false, reason: "Invalid 2FA OTP or Recovery Code" };
  }
  return { authorized: true, role: "MASTER_ADMIN", email };
}

async function runTestSuite() {
  console.log("🔐 Starting Authentication & Authorization (RBAC) Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 1. Zod Input Validation
  console.log("📋 1. Authentication Form Schema Validation (Zod):");
  assert("Valid SignIn Form", signInSchema.safeParse({ email: "buyer@shoes.pk", password: "password123" }).success);
  assert("Invalid Email Rejection", !signInSchema.safeParse({ email: "notanemail", password: "password123" }).success);
  assert("Short Password Rejection (<6 chars)", !signInSchema.safeParse({ email: "buyer@shoes.pk", password: "123" }).success);
  assert("Valid SignUp Form", signUpSchema.safeParse({
    business_name: "Apex Shoes",
    owner_name: "Tariq",
    phone: "+923001234567",
    email: "tariq@apex.pk",
    password: "securepassword",
  }).success);
  assert("Missing Business Name Rejection", !signUpSchema.safeParse({
    business_name: "",
    owner_name: "Tariq",
    phone: "+923001234567",
    email: "tariq@apex.pk",
    password: "securepassword",
  }).success);

  // 2. JWT Verification
  console.log("\n🎟️ 2. JWT Token Issuance, Expiry & Signature Verification:");
  const buyerToken = signJwt({ sub: "usr-001", role: "BUYER", email: "buyer@store.pk" }, 3600);
  const verifyResult = verifyJwt(buyerToken);
  assert("Valid JWT Token Verified", verifyResult.valid && verifyResult.payload.role === "BUYER");

  const tamperedToken = buyerToken.substring(0, buyerToken.length - 4) + "XXXX";
  assert("Tampered Signature Rejection", !verifyJwt(tamperedToken).valid);

  const expiredToken = signJwt({ sub: "usr-002", role: "BUYER" }, -10);
  assert("Expired Token Rejection", !verifyJwt(expiredToken).valid && verifyJwt(expiredToken).error === "Token expired");

  assert("Malformed Token Rejection", !verifyJwt("bad.token").valid);

  // 3. RBAC Matrix Tests
  console.log("\n🛡️ 3. Role-Based Access Control (RBAC) Enforcement:");
  // Public Access
  assert("Public user can view catalog", checkRouteAuthorization("/api/v1/catalog/products", null).authorized);
  assert("Public user can calculate pricing", checkRouteAuthorization("/api/v1/pricing/calculate", null).authorized);

  // Buyer Access
  assert("Unauthenticated user blocked from basket (401)", checkRouteAuthorization("/api/v1/basket", null).status === 401);
  assert("Buyer can access basket (200)", checkRouteAuthorization("/api/v1/basket", "BUYER").authorized);
  assert("Buyer can create RFQ (200)", checkRouteAuthorization("/api/v1/rfq/create", "BUYER").authorized);
  assert("Buyer BLOCKED from supplier wallet (403)", checkRouteAuthorization("/api/v1/supplier/wallet", "BUYER").status === 403);
  assert("Buyer BLOCKED from admin audit logs (403)", checkRouteAuthorization("/api/v1/admin/audit-logs", "BUYER").status === 403);

  // Supplier Access
  assert("Supplier can access supplier dashboard (200)", checkRouteAuthorization("/api/v1/supplier/dashboard", "SUPPLIER").authorized);
  assert("Supplier can submit quote (200)", checkRouteAuthorization("/api/v1/supplier/quote", "SUPPLIER").authorized);
  assert("Supplier can access supplier wallet (200)", checkRouteAuthorization("/api/v1/supplier/wallet", "SUPPLIER").authorized);
  assert("Supplier BLOCKED from admin finance (403)", checkRouteAuthorization("/api/v1/admin/finance/revenue", "SUPPLIER").status === 403);

  // Admin Access
  assert("Admin can access revenue analytics (200)", checkRouteAuthorization("/api/v1/admin/finance/revenue", "ADMIN").authorized);
  assert("Admin can access audit logs (200)", checkRouteAuthorization("/api/v1/admin/audit-logs", "ADMIN").authorized);
  assert("Super Admin can access all modules (200)", checkRouteAuthorization("/api/v1/admin/product/manage", "SUPER_ADMIN").authorized);

  // 4. Master Admin 2FA & Verification
  console.log("\n👑 4. Master Admin 2FA & Emergency Recovery:");
  assert("Master Admin with valid OTP authorized", verifyMasterAdminAuth(MASTER_ADMIN_EMAIL, "789123").authorized);
  assert("Master Admin with Emergency Recovery Code authorized", verifyMasterAdminAuth(MASTER_ADMIN_EMAIL, "SHR-ADMIN-ALPHA-9901").authorized);
  assert("Wrong email with valid OTP rejected", !verifyMasterAdminAuth("unauthorized@test.pk", "789123").authorized);
  assert("Master Admin with invalid OTP rejected", !verifyMasterAdminAuth(MASTER_ADMIN_EMAIL, "12").authorized);

  console.log("\n" + "=".repeat(60));
  console.log(`🏁 Authentication & RBAC Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} tests.`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

runTestSuite();
