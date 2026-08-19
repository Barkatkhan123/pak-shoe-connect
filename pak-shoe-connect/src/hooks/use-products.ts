import { useState, useEffect, useCallback } from "react";
import {
  Product,
  getStoredProducts,
  saveStoredProducts,
  updateStoredProduct,
  addStoredProduct,
  deleteStoredProduct,
  resetStoredProducts,
} from "@/data/products";
import { apiClient } from "@/lib/api-client";

const PRODUCTS_UPDATE_EVENT = "shersha_products_update";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());

  useEffect(() => {
    // 1. Instant render from local cache
    setProducts(getStoredProducts());

    // 2. Background live synchronization from central API Gateway
    apiClient.catalog
      .list()
      .then((res) => {
        if (
          res &&
          res.success &&
          res.data?.products &&
          Array.isArray(res.data.products) &&
          res.data.products.length > 0
        ) {
          saveStoredProducts(res.data.products);
          setProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.warn("[useProducts] Remote sync failed, using cached catalogue:", err);
      });

    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };

    window.addEventListener(PRODUCTS_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(PRODUCTS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const getProductBySlug = useCallback(
    (slug: string) => {
      return products.find((p) => p.slug === slug);
    },
    [products],
  );

  const handleUpdateProduct = useCallback((slug: string, updates: Partial<Product>) => {
    const next = updateStoredProduct(slug, updates);
    setProducts(next);
    return next;
  }, []);

  const handleAddProduct = useCallback((newProduct: Product) => {
    const next = addStoredProduct(newProduct);
    setProducts(next);
    return next;
  }, []);

  const handleDeleteProduct = useCallback((slug: string) => {
    const next = deleteStoredProduct(slug);
    setProducts(next);
    return next;
  }, []);

  const handleResetToDefaults = useCallback(() => {
    const next = resetStoredProducts();
    setProducts(next);
    return next;
  }, []);

  return {
    products,
    getProduct: getProductBySlug,
    updateProduct: handleUpdateProduct,
    addProduct: handleAddProduct,
    deleteProduct: handleDeleteProduct,
    resetToDefaults: handleResetToDefaults,
    featuredProducts: products.filter((p) => p.featured),
    bestSellers: products.filter((p) => p.bestseller),
    trendingProducts: products.filter((p) => p.trending),
    newArrivals: products.filter((p) => p.newArrival),
  };
}

export function useProduct(slug: string) {
  const { products, updateProduct } = useProducts();
  const product = products.find((p) => p.slug === slug);

  const updateThisProduct = useCallback(
    (updates: Partial<Product>) => {
      if (!product) return;
      return updateProduct(product.slug, updates);
    },
    [product, updateProduct],
  );

  return { product, updateProduct: updateThisProduct };
}
