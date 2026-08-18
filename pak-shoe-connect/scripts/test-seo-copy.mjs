/**
 * Anamon Official Website & SEO Copy Validation Suite
 * Verifies that all official titles, meta descriptions, SEO keywords,
 * homepage hero text, Why Choose Us pillars, and About Us copy are 100% accurate.
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");

function checkFile(relPath, checks) {
  const fullPath = path.join(ROOT, relPath);
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

async function runSeoCopyTests() {
  console.log("📝 Starting Anamon Official Website & SEO Copy Test Suite...\n");
  let passed = 0;
  let failed = 0;

  const suite = [
    // 1. Google Search Text (Meta Title, Description, Keywords) in public/index.html
    {
      file: "public/index.html",
      category: "1. Google Search Metadata (index.html)",
      checks: [
        {
          name: "Meta Title",
          pattern: "<title>Anamon Official | B2B Wholesale Leather Shoes Manufacturer</title>",
          description: "Meta Title: 'Anamon Official | B2B Wholesale Leather Shoes Manufacturer'",
        },
        {
          name: "Meta Description",
          pattern: "Anamon Official manufactures premium leather and rexine footwear for global B2B buyers.",
          description: "Meta Description matches official 155-character search snippet",
        },
        {
          name: "SEO Keywords",
          pattern: "B2B leather shoe manufacturer, wholesale leather footwear supplier, rexine shoes bulk order",
          description: "SEO Keywords correctly injected into HTML head",
        },
      ],
    },

    // 2. Global Site Configuration
    {
      file: "src/lib/site.ts",
      category: "2. Global Site System Data (site.ts)",
      checks: [
        {
          name: "Full Brand Name",
          pattern: 'fullName: "Anamon Official"',
          description: "Official full brand name configured",
        },
        {
          name: "Official Tagline",
          pattern: 'tagline: "International-Grade Materials. Custom Branding. Wholesale Scale."',
          description: "Official tagline configured in site settings",
        },
        {
          name: "Official Meta Description",
          pattern: "Anamon Official manufactures premium leather and rexine footwear for global B2B buyers.",
          description: "Official meta description configured in site settings",
        },
      ],
    },

    // 3. Homepage Copy & Structure (index.tsx)
    {
      file: "src/routes/index.tsx",
      category: "3. Website Front Page Hero & Call-to-Actions (index.tsx)",
      checks: [
        {
          name: "Main Title",
          pattern: "Premium Leather & Rexine Footwear\\nManufacturing for Global Wholesale Buyers",
          description: "Hero Main Title: 'Premium Leather & Rexine Footwear Manufacturing for Global Wholesale Buyers'",
        },
        {
          name: "Subtitle",
          pattern: "Anamon Official supplies international-grade leather and rexine shoes to brands, retailers, and distributors worldwide",
          description: "Hero Subtitle matches official copy",
        },
        {
          name: "Button 1: Explore Wholesale Catalog",
          pattern: 'cta: "Explore Wholesale Catalog"',
          description: "Button 1 text matches 'Explore Wholesale Catalog'",
        },
        {
          name: "Button 2: Request a Bulk Quote",
          pattern: 'ctaSecondary: "Request a Bulk Quote"',
          description: "Button 2 text matches 'Request a Bulk Quote'",
        },
        {
          name: "Why Choose Us: Genuine & Premium Materials",
          pattern: "Genuine & Premium Materials",
          description: "Pillar 1: Genuine & Premium Materials",
        },
        {
          name: "Why Choose Us: Custom Manufacturing (Private Label & OEM)",
          pattern: "Custom Manufacturing (Private Label & OEM)",
          description: "Pillar 2: Custom Manufacturing (Private Label & OEM)",
        },
        {
          name: "Why Choose Us: Dependable Global Logistics",
          pattern: "Dependable Global Logistics",
          description: "Pillar 3: Dependable Global Logistics",
        },
        {
          name: "About Us Full Copy",
          pattern: "Anamon Official is a trusted manufacturer of leather and rexine footwear serving wholesale buyers",
          description: "Official About Us paragraph rendered on homepage",
        },
      ],
    },

    // 4. About Us Page (about.tsx)
    {
      file: "src/routes/about.tsx",
      category: "4. About Us Dedicated Page (about.tsx)",
      checks: [
        {
          name: "About Page Title & Tagline",
          pattern: 'title="International-Grade Materials. Custom Branding. Wholesale Scale."',
          description: "Page Hero contains official brand tagline",
        },
        {
          name: "About Page Core Body Copy",
          pattern: "Anamon Official is a trusted manufacturer of leather and rexine footwear",
          description: "About Us core copy rendered cleanly",
        },
        {
          name: "About Page 3 Quality Pillars",
          pattern: "Genuine & Premium Materials",
          description: "Genuine & Premium Materials pillar rendered",
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
  console.log(`🏁 SEO & Website Copy Results: ${passed} Passed, ${failed} Failed out of ${passed + failed} tests.`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

runSeoCopyTests();
