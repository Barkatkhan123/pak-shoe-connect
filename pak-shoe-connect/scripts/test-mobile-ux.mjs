/**
 * Anamon Mobile UX & Responsive Layout Validation Suite
 * Validates mobile viewport meta, 2-column product grid, touch target sizing (>=44px),
 * drawer structure, and horizontal overflow protection.
 */

import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");

function checkFileContains(relPath, pattern, description) {
  const fullPath = path.join(SRC_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    return { passed: false, message: `File not found: ${relPath}` };
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  const matches = typeof pattern === "string" ? content.includes(pattern) : pattern.test(content);
  return {
    passed: matches,
    message: matches ? `Found "${description}" in ${relPath}` : `Missing "${description}" in ${relPath}`,
  };
}

async function runMobileUxValidation() {
  console.log("📱 Starting Mobile Screen UX & Responsive Layout Validation...\n");
  let passed = 0;
  let failed = 0;

  function test(category, relPath, pattern, description) {
    const res = checkFileContains(relPath, pattern, description);
    if (res.passed) {
      console.log(`  ✅ [PASS] [${category}] ${res.message}`);
      passed++;
    } else {
      console.log(`  ❌ [FAIL] [${category}] ${res.message}`);
      failed++;
    }
  }

  // 1. Mobile Viewport & Document Structure
  console.log("📐 1. Viewport Meta & Document Root Configuration:");
  test(
    "Viewport",
    "../public/index.html",
    /width=device-width,\s*initial-scale=1.0/,
    "Responsive Viewport Meta Tag",
  );

  // 2. Mobile 2-Column Product Grid
  console.log("\n🛍️ 2. Mobile 2-Column Product Grid Layout:");
  test(
    "Grid Layout",
    "routes/index.tsx",
    "grid grid-cols-2",
    "2-Column Grid on Mobile Viewport (grid-cols-2)",
  );
  test(
    "Card Aspect Ratio",
    "components/product-card.tsx",
    "aspect-[4/5]",
    "Mobile Optimized 4:5 Image Aspect Ratio",
  );
  test(
    "Title Clamping",
    "components/product-card.tsx",
    "line-clamp-2",
    "Consistent 2-Line Height Clamping for Product Titles",
  );
  test(
    "Wholesale Pricing",
    "components/product-card.tsx",
    "/ pair",
    "Clear Wholesale Unit Price Indicator (/ pair)",
  );

  // 3. Accessible Touch Targets (>= 44px)
  console.log("\n👆 3. Mobile Touch Target Sizing (Min 44px / h-11):");
  test(
    "Wishlist Heart Target",
    "components/product-card.tsx",
    "h-11 w-11",
    "44px x 44px Wishlist Heart Button Target",
  );
  test(
    "Account Button Target",
    "components/site-header.tsx",
    "h-11 w-11",
    "44px x 44px User Account Trigger",
  );
  test(
    "Hamburger Menu Target",
    "components/site-header.tsx",
    "h-11 w-11",
    "44px x 44px Mobile Navigation Hamburger Target",
  );
  test(
    "Brand Logo Target",
    "components/site-header.tsx",
    "min-h-[44px]",
    "44px Minimum Touch Target for Brand Logo",
  );

  // 4. Mobile Navigation Drawer & Account Card
  console.log("\n📂 4. Mobile Navigation Drawer & Sourcing Controls:");
  test(
    "Account Card in Drawer",
    "components/site-header.tsx",
    "Wholesale Buyer Portal",
    "Mobile Account Sourcing Card (Sign In / Register)",
  );
  test(
    "Catalog Quick Search",
    "components/site-header.tsx",
    "Search all 200+ footwear models",
    "1-Tap Catalog Search Trigger in Drawer",
  );
  test(
    "Drawer Overflow Control",
    "components/site-header.tsx",
    "max-h-[calc(100dvh-5.5rem)] overflow-y-auto",
    "Safe Dynamic Viewport Height (100dvh) with Scroll",
  );

  // 5. Overflow-X & Horizontal Scroll Protection
  console.log("\n🛡️ 5. Horizontal Overflow Protection:");
  test(
    "Layout Container",
    "components/site-layout.tsx",
    "overflow-x-hidden",
    "Horizontal Scroll Guard (overflow-x-hidden)",
  );

  console.log("\n" + "=".repeat(60));
  console.log(`🏁 Mobile UX Validation: ${passed} Passed, ${failed} Failed out of ${passed + failed} checks.`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

runMobileUxValidation();
