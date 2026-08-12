import { MeiliSearch } from "meilisearch";

const MEILI_HOST = process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700";
const MEILI_KEY = process.env.MEILISEARCH_API_KEY || "masterKey";

export const meiliClient = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_KEY,
  timeout: process.env.NODE_ENV === "test" ? 50 : 2000,
});

export const PRODUCTS_INDEX = "products";

/**
 * Ensures index and search ranking weights are configured
 */
export async function initializeMeilisearch() {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    await index.updateSettings({
      searchableAttributes: [
        "title",
        "nameUrdu",
        "categoryName",
        "factoryName",
        "description",
        "city",
        "material",
      ],
      filterableAttributes: [
        "categoryId",
        "gender",
        "isVerified",
        "moq",
        "startingPrice",
        "city",
      ],
      sortableAttributes: ["startingPrice", "moq", "supplierScore", "createdAt"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
    });
    console.log("✅ Meilisearch Products Index Configured Successfully");
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      // Graceful fallback for local dev when Meilisearch daemon is offline
      console.log("ℹ️ [Search Layer] Meilisearch offline in local dev; PostgreSQL full-text fallback active.");
    } else {
      console.error("🔴 Meilisearch Index Initialization Error:", err);
    }
  }
}
