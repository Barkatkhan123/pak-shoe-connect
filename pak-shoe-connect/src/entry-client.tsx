import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<RouterProvider router={router} />);
} else {
  const div = document.createElement("div");
  div.id = "root";
  document.body.appendChild(div);
  createRoot(div).render(<RouterProvider router={router} />);
}
