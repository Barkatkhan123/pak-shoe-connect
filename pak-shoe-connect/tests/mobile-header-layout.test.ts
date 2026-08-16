import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteHeader } from "../src/components/site-header";
import { SiteLayout } from "../src/components/site-layout";

// Mock router / hooks if necessary
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, activeProps, activeOptions, ...props }: any) => React.createElement("a", props, children),
  useRouter: () => ({
    subscribe: () => () => {},
  }),
  useNavigate: () => () => {},
}));

vi.mock("@/hooks/use-wishlist", () => ({
  useWishlist: () => ({ count: 2 }),
}));

vi.mock("@/hooks/use-inquiry-basket", () => ({
  useInquiryBasket: () => ({ count: 1, items: [] }),
}));

import * as fs from "fs";
import * as path from "path";

describe("Mobile Header Architecture & CLS Prevention Test Suite", () => {
  it("renders a unified sticky header containing AnnouncementBar, Navigation, and Gold Accent Divider", () => {
    const html = renderToStaticMarkup(React.createElement(SiteHeader));

    // 1. Header is root element with sticky positioning and persistent gold border
    expect(html).toContain("<header");
    expect(html).toContain("sticky top-0");
    expect(html).toContain("border-b-2 border-gold");
    expect(html).toContain("w-full max-w-full");

    // 2. Announcement bar is nested within the header and has safe-top
    expect(html).toContain("safe-top");
    expect(html).toContain("Premium Footwear Manufacturing · Delivery across Pakistan");

    // 3. Main Navigation has invariant fixed height geometry (h-16 on mobile, h-[72px] on desktop)
    expect(html).toContain("h-16 sm:h-[72px]");

    // 4. Branding and Actions are intact
    expect(html).toContain("B2B Wholesale");
    expect(html).toContain("Inquiry Basket");
  });

  it("ensures SiteLayout wraps SiteHeader and Page Content with Scroll Indicator without obstructing document flow", () => {
    const html = renderToStaticMarkup(
      React.createElement(SiteLayout, null, React.createElement("div", { id: "test-content" }, "Hero Content"))
    );

    // Header is rendered first in layout
    expect(html).toContain("<header");
    // Main content area wraps children
    expect(html).toContain("id=\"test-content\"");
    // Scroll indicator has pointer-events-none to prevent layout / click blocking
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("fixed top-0 left-0 right-0 h-[3px]");
  });

  it("validates styles.css root normalization and safe-area utilities", () => {
    const cssPath = path.resolve(__dirname, "../src/styles.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Box sizing applied to all elements
    expect(cssContent).toContain("box-sizing: border-box;");
    // Root margin, padding, width constraints
    expect(cssContent).toContain("width: 100%;");
    expect(cssContent).toContain("max-width: 100%;");
    // Safe area utility definitions
    expect(cssContent).toContain("@utility safe-top");
    expect(cssContent).toContain("padding-top: env(safe-area-inset-top, 0px);");
  });
});
