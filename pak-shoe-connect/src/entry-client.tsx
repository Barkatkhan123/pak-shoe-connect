import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

try {
  const router = getRouter();
  const rootElement = document.getElementById("root") || document.body;
  const root = createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
  console.log("✅ Anamon B2B Marketplace SPA mounted successfully.");
} catch (err) {
  console.error("Mount error:", err);
}
