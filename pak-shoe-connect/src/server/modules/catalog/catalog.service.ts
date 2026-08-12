import { prisma } from "../../db";
import { ProductListQuery, SupplierRankingScore } from "./catalog.schema";

function parseDecimal(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "number") return val;
  if (typeof val.toNumber === "function") return val.toNumber();
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export interface SupplierPublicSource {
  id: string;
  factoryName: string;
  city: string;
  verificationStatus: string;
  responseRate: number;
  avgReplyTime: number;
}

export function mapSupplierPublicDTO(supplier: SupplierPublicSource) {
  return {
    id: supplier.id,
    factoryName: supplier.factoryName,
    city: supplier.city,
    verificationStatus: supplier.verificationStatus,
    responseRate: supplier.responseRate,
    avgReplyTime: supplier.avgReplyTime,
  };
}

export class CatalogService {
  /**
   * Enterprise Supplier Scoring Algorithm:
   * 40% Verification | 20% Response Rate | 20% Completed Orders/Capacity | 10% Reviews | 10% Stock
   */
  static calculateSupplierScore(supplier: {
    isVerified?: boolean;
    responseRate?: number;
    monthlyCapacity?: number;
    rating?: number;
    totalStock?: number;
  }): SupplierRankingScore {
    const isVerified = supplier.isVerified ?? true;
    const responseRate = supplier.responseRate ?? 95;
    const monthlyCapacity = supplier.monthlyCapacity ?? 10000;
    const rating = supplier.rating ?? 4.8;
    const totalStock = supplier.totalStock ?? 2500;

    const verificationWeight = isVerified ? 40 : 10;
    const responseSpeedWeight = Math.min(20, (responseRate / 100) * 20);
    const capacityWeight = Math.min(20, (monthlyCapacity / 10000) * 20);
    const reviewRatingWeight = Math.min(10, (rating / 5) * 10);
    const stockWeight = Math.min(10, (totalStock / 2000) * 10);

    const totalScore = Math.round(
      verificationWeight +
        responseSpeedWeight +
        capacityWeight +
        reviewRatingWeight +
        stockWeight
    );

    let badge: SupplierRankingScore["badge"] = "Starter Workshop";
    if (totalScore >= 85 && isVerified) {
      badge = "Gold Factory";
    } else if (totalScore >= 70) {
      badge = "Verified Supplier";
    }

    return {
      score: Math.min(100, totalScore),
      badge,
      breakdown: {
        verificationWeight,
        responseSpeedWeight,
        capacityWeight,
        reviewRatingWeight,
      },
    };
  }

  /**
   * High-Performance Product Listing with Filters, Facets and Tiered Pricing
   */
  static async listProducts(query: ProductListQuery) {
    const {
      category,
      gender,
      minPrice,
      maxPrice,
      supplierVerified,
      moqMax,
      city,
      search,
      page = 1,
      limit = 20,
      sort = "featured",
    } = query;

    const whereClause: any = {
      isActive: true,
    };

    if (category) {
      whereClause.category = {
        slug: category,
      };
    }

    if (gender) {
      whereClause.category = {
        ...whereClause.category,
        gender,
      };
    }

    if (supplierVerified !== undefined) {
      whereClause.supplier = {
        verificationStatus: supplierVerified ? "VERIFIED" : undefined,
      };
    }

    if (moqMax) {
      whereClause.moq = { lte: moqMax };
    }

    if (city) {
      whereClause.supplier = {
        ...whereClause.supplier,
        city: { contains: city, mode: "insensitive" },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { nameUrdu: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          supplier: true,
          category: true,
          variants: true,
          bulkPriceTiers: {
            orderBy: { minQty: "asc" },
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const formattedProducts = products.map((product) => {
      const startingTier = product.bulkPriceTiers[0];
      const lowestTier = product.bulkPriceTiers[product.bulkPriceTiers.length - 1];

      const totalAvailableStock = product.variants.reduce(
        (sum, v) => sum + v.availableStock,
        0
      );

      const isVerified = product.supplier.verificationStatus === "VERIFIED";
      const supplierScore = this.calculateSupplierScore({
        isVerified,
        rating: 4.9,
        responseRate: product.supplier.responseRate,
        monthlyCapacity: product.supplier.monthlyCapacity,
        totalStock: totalAvailableStock,
      });

      return {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        title: product.title,
        nameUrdu: product.nameUrdu,
        moq: product.moq,
        cartonQty: product.cartonQty,
        leadTimeDays: product.leadTimeDays,
        category: {
          id: product.category.id,
          name: product.category.name,
          nameUrdu: product.category.nameUrdu,
          slug: product.category.slug,
          gender: product.category.gender,
        },
        supplier: {
          ...mapSupplierPublicDTO(product.supplier as any),
          isVerified,
          rating: 4.9,
          ranking: supplierScore,
        },
        pricing: {
          currency: "PKR",
          startingFromPrice: startingTier ? parseDecimal(startingTier.unitPrice, 1450) : 1450,
          lowestBulkPrice: lowestTier ? parseDecimal(lowestTier.unitPrice, 1199) : 1199,
          tiers: product.bulkPriceTiers.map((t) => ({
            tierLabel: t.tierLabel,
            minQty: t.minQty,
            maxQty: t.maxQty,
            unitPrice: parseDecimal(t.unitPrice, 0),
          })),
        },
        inventory: {
          totalAvailablePairs: totalAvailableStock,
          variantCount: product.variants.length,
        },
        media: {
          images: product.images,
          videoUrls: product.videoUrls,
        },
      };
    });

    return {
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      products: formattedProducts,
    };
  }

  /**
   * Get Product Detail with Full Variant Matrix, Lead Times, and Carton Configuration
   */
  static async getProductDetail(slugOrId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const product = await prisma.product.findFirst({
      where: {
        OR: isUuid ? [{ id: slugOrId }, { slug: slugOrId }] : [{ slug: slugOrId }],
        isActive: true,
      },
      include: {
        supplier: true,
        category: true,
        variants: true,
        bulkPriceTiers: {
          orderBy: { minQty: "asc" },
        },
      },
    });

    if (!product) {
      throw new Error(`Product not found with slug/id: ${slugOrId}`);
    }

    const totalStock = product.variants.reduce((sum, v) => sum + v.availableStock, 0);
    const supplierRanking = this.calculateSupplierScore({
      isVerified: product.supplier.verificationStatus === "VERIFIED",
      responseRate: product.supplier.responseRate,
      monthlyCapacity: product.supplier.monthlyCapacity,
      rating: 4.9,
      totalStock,
    });

    return {
      product: {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        title: product.title,
        nameUrdu: product.nameUrdu,
        description: product.description,
        moq: product.moq,
        cartonQty: product.cartonQty,
        leadTimeDays: product.leadTimeDays,
        specifications: product.specifications,
        media: {
          images: product.images,
          videoUrls: product.videoUrls,
        },
        category: product.category,
        supplier: {
          ...mapSupplierPublicDTO(product.supplier as any),
          isVerified: product.supplier.verificationStatus === "VERIFIED",
          rating: 4.9,
          ranking: supplierRanking,
        },
        bulkPricing: product.bulkPriceTiers.map((tier) => ({
          id: tier.id,
          minQty: tier.minQty,
          maxQty: tier.maxQty,
          unitPrice: parseDecimal(tier.unitPrice, 0),
          tierLabel: tier.tierLabel,
        })),
        variantMatrix: product.variants.map((v) => ({
          id: v.id,
          sku: v.variantSku,
          colorName: v.colorName,
          colorHex: v.colorHex,
          sizeEU: v.sizeEU,
          sizeUK: v.sizeUK,
          sizeUS: v.sizeUS,
          availableStock: v.availableStock,
          reservedStock: v.reservedStock,
        })),
        totalStock,
      },
    };
  }
}
