// @ts-ignore
import { Router } from "express";
import { CatalogController } from "./catalog.controller";

export const catalogRouter = Router();

// Full-text & facet search
catalogRouter.get("/search", CatalogController.searchProducts);

// Category taxonomies with product counts
catalogRouter.get("/categories", CatalogController.getCategories);

// Filtered product listing with supplier ranking & Redis cache
catalogRouter.get("/products", CatalogController.listProducts);

// Detailed product specifications, tiers, and factory credentials
catalogRouter.get("/products/:id", CatalogController.getProductDetail);
