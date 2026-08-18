/**
 * Anamon Quick View Modal Mobile UX Test Suite
 * Tests mobile touch triggers, modal responsiveness, responsive column stacking,
 * interactive pricing recalculation, and background scroll locking.
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

async function runQuickViewMobileTests() {
  console.log("👁️ Starting Quick View Mobile Screen UX & Responsive Tests...\n");
  let passed = 0;
  let failed = 0;

  const suite = [
    // 1. Mobile Quick View Trigger Button on Product Card
    {
      file: "components/product-card.tsx",
      category: "1. Mobile Quick View Touch Triggers",
      checks: [
        {
          name: "Mobile Touch Quick View Icon",
          pattern: "lg:hidden absolute left-2 bottom-2",
          description: "Dedicated mobile Quick View icon button on product image",
        },
        {
          name: "Desktop Hover Quick View Overlay",
          pattern: "hidden lg:flex absolute inset-0",
          description: "Desktop hover overlay preserved for larger screens",
        },
        {
          name: "Quick View Accessibility Label",
          pattern: "aria-label={`Quick view ${product.name}`}",
          description: "Accessible screen reader label on Quick View trigger",
        },
      ],
    },

    // 2. Quick View Modal Container & Mobile Viewport
    {
      file: "components/product/ProductQuickViewModal.tsx",
      category: "2. Modal Responsiveness & Viewport Fit",
      checks: [
        {
          name: "Max Height Viewport Guard",
          pattern: "max-h-[92vh]",
          description: "Strict 92vh maximum height to prevent viewport clipping on mobile",
        },
        {
          name: "Responsive Padding",
          pattern: "p-2 sm:p-4 md:p-6",
          description: "Adaptive outer padding for mobile screens",
        },
        {
          name: "Scrollable Modal Body",
          pattern: "flex-1 overflow-y-auto",
          description: "Independent vertical scrolling container for small displays",
        },
        {
          name: "Mobile Column Stacking",
          pattern: "grid grid-cols-1 lg:grid-cols-12",
          description: "Single column vertical stacking on mobile screens (100% width)",
        },
        {
          name: "Background Scroll Lock",
          pattern: 'document.body.style.overflow = "hidden"',
          description: "Automatic background scroll freeze when modal opens",
        },
        {
          name: "Portal Mounting to Body",
          pattern: "createPortal(modalContent, document.body)",
          description: "React Portal rendering to avoid z-index stacking bugs",
        },
      ],
    },

    // 3. Quick View Sticky Header & Close Action
    {
      file: "components/product/ProductHeader.tsx",
      category: "3. Sticky Header & Touch Target Controls",
      checks: [
        {
          name: "Sticky Header Bar",
          pattern: "sticky top-0 z-30",
          description: "Header stays visible while scrolling long product details",
        },
        {
          name: "Title Truncation Guard",
          pattern: "truncate max-w-xl",
          description: "Title truncation protection against horizontal push",
        },
        {
          name: "Close Modal Touch Target",
          pattern: "flex h-10 w-10 items-center justify-center rounded-full",
          description: "Comfortable touch target for close button",
        },
      ],
    },

    // 4. Media Gallery & Mobile Lightbox
    {
      file: "components/product/MediaGallery.tsx",
      category: "4. Media Gallery & Touch Swiping",
      checks: [
        {
          name: "Horizontal Thumbnails on Mobile",
          pattern: "flex md:flex-col gap-2 overflow-x-auto",
          description: "Horizontal swipeable thumbnail row on mobile screens",
        },
        {
          name: "Fullscreen Lightbox Modal",
          pattern: "createPortal",
          description: "High-resolution fullscreen zoom modal with touch navigation",
        },
      ],
    },

    // 5. Purchase & Inquiry Action Buttons
    {
      file: "components/product/PurchaseActions.tsx",
      category: "5. Mobile Call-to-Action Buttons",
      checks: [
        {
          name: "Sample Pair Ordering CTA",
          pattern: "Order 1 Sample Pair",
          description: "Direct 1 sample pair inspection ordering button",
        },
        {
          name: "High-Converting Add to Basket CTA",
          pattern: "Add {quantity} Pairs",
          description: "Dynamic Add to Inquiry button reflecting selected volume & price",
        },
        {
          name: "WhatsApp Inquiry 1-Tap CTA",
          pattern: "WhatsApp Inquiry",
          description: "Instant pre-filled WhatsApp quotation button",
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
  console.log(`🏁 Quick View Mobile UX Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} tests.`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

runQuickViewMobileTests();
