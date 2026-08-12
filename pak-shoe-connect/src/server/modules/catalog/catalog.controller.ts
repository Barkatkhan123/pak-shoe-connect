// @ts-ignore
import { Request, Response } from "express";
import { ProductListQuerySchema } from "./catalog.schema";
import { CatalogService } from "./catalog.service";
import { SearchService } from "../search/search.service";
import { prisma } from "../../db";

export class CatalogController {
  /**
   * GET /api/v1/catalog/products
   */
  static async listProducts(req: Request, res: Response) {
    try {
      const parsedQuery = ProductListQuerySchema.parse(req.query);
      const result = await CatalogService.listProducts(parsedQuery);
      return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || "Invalid catalog query parameters",
      });
    }
  }

  /**
   * GET /api/v1/catalog/products/:id
   */
  static async getProductDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await CatalogService.getProductDetail(id);
      return res.status(200).json({ success: true, product });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: error.message || "Product not found",
      });
    }
  }

  /**
   * GET /api/v1/catalog/search
   */
  static async searchProducts(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || "";
      const results = await SearchService.searchCatalog(query, {
        category: req.query.category as string,
        gender: req.query.gender as string,
        verifiedOnly: req.query.verified === "true",
        maxMoq: req.query.maxMoq ? Number(req.query.maxMoq) : undefined,
        city: req.query.city as string,
      });

      return res.status(200).json({ success: true, ...results });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Search query processing failed",
      });
    }
  }

  /**
   * GET /api/v1/catalog/categories
   */
  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          nameUrdu: c.nameUrdu,
          slug: c.slug,
          productCount: c._count.products,
        })),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch categories",
      });
    }
  }
}
