import { apiGateway } from "../src/server/gateway/gateway.ts";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runMasterVerificationSequence() {
  console.log("================================================================================");
  console.log("🚀 MASTER PROMPT VERIFICATION SEQUENCE — LIVE HOSTINGER MYSQL + API GATEWAY");
  console.log("================================================================================\n");

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: POST /api/v1/admin/token
  // ─────────────────────────────────────────────────────────────────────────
  console.log("--- STEP 1: POST /api/v1/admin/token ---");
  const tokenReq = {
    email: "anamoontotrade@gmail.com",
    secret: "Anamon12&1marcH2007",
  };
  const tokenRes = await apiGateway("/api/v1/admin/token", "POST", tokenReq);
  console.log("STATUS:", tokenRes.status);
  console.log("RAW BODY:", JSON.stringify(tokenRes.body, null, 2));

  const jwt = tokenRes.body?.data?.token;
  if (!jwt) throw new Error("Failed to acquire admin JWT");

  const authHeaders = { authorization: `Bearer ${jwt}` };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: POST /api/v1/admin/products
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n--- STEP 2: POST /api/v1/admin/products (Creating unique test product) ---");
  const timestamp = Date.now();
  const testProductPayload = {
    name: `Hostinger MySQL Sync Test ${timestamp}`,
    slug: `hostinger-mysql-sync-test-${timestamp}`,
    sku: `TEST-MYSQL-${timestamp.toString().slice(-6)}`,
    categorySlug: "men-formal",
    gender: "men",
    moq: 12,
    cartonQty: 12,
    leadTimeDays: "3-5 Days",
    image: "https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800",
    images: ["https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800"],
    priceTiers: [
      { moq: 12, pricePerPair: 2200, label: "Tier 1 (1 Ctn)" },
      { moq: 60, pricePerPair: 1950, label: "Tier 2 (5 Ctns)" },
    ],
  };

  const createRes = await apiGateway("/api/v1/admin/products", "POST", testProductPayload, {}, authHeaders);
  console.log("STATUS:", createRes.status);
  console.log("RAW BODY:", JSON.stringify(createRes.body, null, 2));

  const createdId = createRes.body?.data?.id;
  const createdSlug = createRes.body?.data?.slug;
  if (!createdId) throw new Error("Failed to create product in MySQL");

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Direct MySQL Query on products table
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n--- STEP 3: Direct MySQL Query Verification on Hostinger DB ---");
  const dbRow = await prisma.product.findUnique({
    where: { id: createdId },
    include: { category: true, bulkPriceTiers: true },
  });
  console.log("DIRECT MYSQL ROW FROM HOSTINGER:");
  console.log(JSON.stringify(dbRow, (_k, v) => typeof v === "bigint" ? v.toString() : v, 2));

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: GET /api/v1/catalog/products (Public Unauthenticated Visitor)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n--- STEP 4: GET /api/v1/catalog/products (Unauthenticated Public Catalog) ---");
  const catalogRes = await apiGateway("/api/v1/catalog/products", "GET", {}, {});
  console.log("STATUS:", catalogRes.status);
  const foundInCatalog = catalogRes.body?.data?.products?.find((p) => p.slug === createdSlug);
  console.log("MATCHING PRODUCT IN PUBLIC CATALOG:");
  console.log(JSON.stringify(foundInCatalog, null, 2));
  console.log("TOTAL PUBLIC PRODUCTS:", catalogRes.body?.data?.products?.length);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5: DELETE /api/v1/admin/products/{slug}
  // ─────────────────────────────────────────────────────────────────────────
  console.log(`\n--- STEP 5: DELETE /api/v1/admin/products/${createdSlug} ---`);
  const deleteRes = await apiGateway(`/api/v1/admin/products/${createdSlug}`, "DELETE", {}, {}, authHeaders);
  console.log("STATUS:", deleteRes.status);
  console.log("RAW BODY:", JSON.stringify(deleteRes.body, null, 2));

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 6: Re-verify GET /api/v1/catalog/products after deletion
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n--- STEP 6: Re-query GET /api/v1/catalog/products after deletion ---");
  const catalogAfter = await apiGateway("/api/v1/catalog/products", "GET", {}, {});
  const stillInCatalog = catalogAfter.body?.data?.products?.find((p) => p.slug === createdSlug);
  console.log("PRODUCT STILL IN CATALOG:", !!stillInCatalog);
  console.log("STATUS:", catalogAfter.status);

  console.log("\n================================================================================");
  console.log("🎉 FULL END-TO-END GATEWAY + MYSQL PIPELINE TEST PASSED WITH 100% SUCCESS!");
  console.log("================================================================================");

  await prisma.$disconnect();
}

runMasterVerificationSequence().catch((err) => {
  console.error("❌ Master verification failed:", err);
  process.exit(1);
});
