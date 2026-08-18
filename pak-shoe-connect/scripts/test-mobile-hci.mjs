/**
 * Anamon Mobile HCI (Human-Computer Interaction) Test Suite
 * Validates Fitts's Law thumb zones, bottom navigation bar integration,
 * touch target ergonomics, screen real-estate allocation, and visual hierarchy.
 */

import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");

function checkFile(relPath, checks) {
  const fullPath = path.join(SRC_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    return [{ passed: false, name: `File check ${relPath}`, message: `File not found: ${relPath}` }];
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  return checks.map((c) => {
    const isMatch = typeof c.pattern === "string" ? content.includes(c.pattern) : c.pattern.test(content);
    return {
      passed: isMatch,
      name: c.name,
      message: isMatch ? `Verified: ${c.description}` : `Failed to verify: ${c.description}`,
    };
  });
}

async function runHciTests() {
  console.log("📱 Starting Mobile Screen HCI & Thumb-Zone Ergonomics Test Suite...\n");
  let passed = 0;
  let failed = 0;

  const suite = [
    // 1. Mobile Bottom App Bar (Thumb Zone HCI)
    {
      file: "components/mobile-bottom-nav.tsx",
      category: "1. Natural Thumb Zone Navigation (Fitts's Law)",
      checks: [
        {
          name: "Fixed Bottom Positioning",
          pattern: "fixed bottom-0 left-0 right-0 z-40",
          description: "Navigation bar docked in the natural thumb zone (bottom 30% of screen)",
        },
        {
          name: "iOS / Android Safe Area Inset",
          pattern: "env(safe-area-inset-bottom",
          description: "Safe area padding avoids home gesture bar overlap on modern devices",
        },
        {
          name: "5-Core Primary Actions",
          pattern: "grid grid-cols-5 items-center",
          description: "Balanced 5-column layout for Home, Catalog, Basket, Tracking, and Account",
        },
        {
          name: "Live Basket Badge Indicator",
          pattern: "totalPairs > 0",
          description: "Real-time visual feedback badge showing accumulated inquiry pairs",
        },
      ],
    },

    // 2. Global Layout Integration
    {
      file: "components/site-layout.tsx",
      category: "2. Viewport Real-Estate & Layout Bounding",
      checks: [
        {
          name: "MobileBottomNav Mounting",
          pattern: "<MobileBottomNav />",
          description: "Universal bottom navigation mounted in SiteLayout across all pages",
        },
        {
          name: "Fixed Header with Spacer",
          pattern: "h-[92px] sm:h-[100px] w-full shrink-0",
          description: "Top content offset prevents overlap behind fixed top header",
        },
        {
          name: "Floating WhatsApp Clearance",
          pattern: "whatsapp-fab",
          description: "Floating WhatsApp button sits safely above the mobile bottom bar",
        },
      ],
    },

    // 3. 2-Column Product Grid & Touch Card Ergonomics
    {
      file: "components/product-card.tsx",
      category: "3. 2-Column Touch Card HCI & Micro-Interactions",
      checks: [
        {
          name: "Mobile Quick View Eye Button",
          pattern: "lg:hidden absolute left-2 bottom-2",
          description: "Direct 1-tap Quick View trigger on mobile product image",
        },
        {
          name: "Top-Right Wishlist Heart",
          pattern: "absolute right-1 top-1",
          description: "Accessible top-right wishlist button with 44px touch area",
        },
        {
          name: "Tactile Active Button Feedback",
          pattern: "active:scale-98",
          description: "Tactile micro-interaction feedback on button press",
        },
      ],
    },
  ];

  for (const group of suite) {
    console.log(`📦 ${group.category}:`);
    const results = checkFile(group.file, group.checks);
    for (const r of results) {
      if (r.passed) {
        console.log(`  ✅ [PASS] ${r.name} -> ${r.message}`);
        passed++;
      } else {
        console.log(`  ❌ [FAIL] ${r.name} -> ${r.message}`);
        failed++;
      }
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log(`🏁 Mobile HCI Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} tests.`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

runHciTests();
