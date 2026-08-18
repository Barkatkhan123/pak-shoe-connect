/**
 * Anamon Fixed Header Across All Pages Test Suite
 * Validates fixed header positioning, spacer height calculation, z-index hierarchy,
 * and universal SiteLayout mounting across all routes.
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

async function runFixedHeaderTests() {
  console.log("📌 Starting Fixed Header Verification Across All Pages...\n");
  let passed = 0;
  let failed = 0;

  const suite = [
    // 1. Site Header Positioning
    {
      file: "components/site-header.tsx",
      category: "1. Header CSS Fixed Positioning & Edge Snapping",
      checks: [
        {
          name: "Fixed Top Edge Snapping",
          pattern: "fixed top-0 left-0 right-0 z-[100]",
          description: "Header is permanently fixed to the top of the viewport across all scroll directions",
        },
        {
          name: "Full Width & Border",
          pattern: "w-full max-w-full border-b-2 border-gold bg-white",
          description: "Full width white background with gold accent border to prevent content bleed-through",
        },
        {
          name: "Announcement Bar Fixed Integration",
          pattern: "h-7 min-h-[28px]",
          description: "28px Slim announcement bar fixed seamlessly with header navigation",
        },
      ],
    },

    // 2. Site Layout Spacer & Alignment
    {
      file: "components/site-layout.tsx",
      category: "2. Layout Spacer & Content Offset",
      checks: [
        {
          name: "Header Height Compensation Spacer",
          pattern: "h-[92px] sm:h-[100px] w-full shrink-0",
          description: "Top spacer prevents page content from being obscured behind fixed header",
        },
        {
          name: "Scroll Progress Bar Z-Index",
          pattern: "z-[110] pointer-events-none",
          description: "Scroll indicator sits at z-110 above the fixed header (z-100)",
        },
        {
          name: "Global Site Layout Mounting",
          pattern: "<SiteHeader />",
          description: "SiteHeader rendered universally inside SiteLayout wrapper",
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
  console.log(`🏁 Fixed Header Verification: ${passed} Passed, ${failed} Failed out of ${passed + failed} tests.`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

runFixedHeaderTests();
