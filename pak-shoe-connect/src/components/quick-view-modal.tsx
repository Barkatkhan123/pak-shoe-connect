/**
 * Master Enterprise Product Quick View Modal System
 * Powered by HCI-compliant 50/50 split layout, HD video studio, Alibaba-style bulk pricing,
 * verified factory credentials, and dynamic freight calculation.
 */

import type { Product } from "@/data/products";
import { ProductQuickViewModal } from "./product/ProductQuickViewModal";

export { ProductQuickViewModal };

export function QuickViewModal({
  product,
  isOpen = true,
  onClose,
}: {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}) {
  return (
    <ProductQuickViewModal
      product={product}
      isOpen={isOpen && !!product}
      onClose={onClose}
    />
  );
}
