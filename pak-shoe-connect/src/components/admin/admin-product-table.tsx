import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileVideo,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  MoreHorizontal,
  Package,
} from "lucide-react";

import { Product } from "@/data/products";

interface AdminProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productSlug: string) => void;
  onToggleStatus: (productSlug: string) => void;
  onAddNewClick: () => void;
}

export function AdminProductTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onAddNewClick,
}: AdminProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Delete Confirmation Dialog State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filter products logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categorySlug && p.categorySlug.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || p.categorySlug === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "IN_STOCK" && p.inStock) ||
      (statusFilter === "FEATURED" && p.featured) ||
      (statusFilter === "BESTSELLER" && p.bestseller);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const confirmDelete = () => {
    if (!productToDelete) return;
    onDeleteProduct(productToDelete.slug);
    // BUG-12 FIX: Removed duplicate toast. The parent handleDeleteProduct
    // already calls toast.success("Product deleted") after a successful API call.
    setProductToDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search, Filters & Action Buttons ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title, SKU code, material..."
              className="pl-9 bg-slate-950 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="men-formal">Men's Formal</option>
            <option value="casual-sneakers">Casual Sneakers</option>
            <option value="traditional-chappal">Traditional Chappal</option>
            <option value="women-heels">Women's Heels</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="FEATURED">⭐ Featured</option>
            <option value="BESTSELLER">🏷️ Best Seller</option>
          </select>
        </div>

        {/* Add Product Button */}
        <Button
          onClick={onAddNewClick}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 text-xs h-10 px-5 shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* ── Products Table Card ── */}
      <Card className="border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-slate-900 border-b border-slate-800">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider py-4">
                Product Details
              </TableHead>
              <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider py-4">
                Category & Gender
              </TableHead>
              <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider py-4">
                Price Range & MOQ
              </TableHead>
              <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider py-4">
                Variants & Colors
              </TableHead>
              <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider py-4">
                Status & Badges
              </TableHead>
              <TableHead className="text-slate-400 text-xs font-bold uppercase tracking-wider py-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-800/60">
            {filteredProducts.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="text-sm font-semibold">No products found matching your search</p>
                  <p className="text-xs">Try adjusting your filters or create a new product.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow
                  key={p.slug}
                  className="border-slate-800/60 hover:bg-slate-900/80 transition-colors"
                >
                  {/* Product Title & Image */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-100 text-sm line-clamp-1">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-amber-400 font-medium">{p.sku}</span>
                          {p.video && (
                            <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <FileVideo className="h-3 w-3" /> Video
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category & Gender */}
                  <TableCell className="py-3">
                    <div className="text-xs font-semibold text-slate-200 capitalize">
                      {(p.categorySlug || "men-formal").replace(/-/g, " ")}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      Target: {p.gender || "Men"}
                    </div>
                  </TableCell>

                  {/* Price & MOQ */}
                  <TableCell className="py-3">
                    <div className="text-xs font-bold text-amber-400 font-mono">
                      {p.priceLabel || `PKR ${p.priceTiers?.[0]?.pricePerPair || 1850}`}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      MOQ: <span className="font-semibold text-slate-200">{p.moq || 12} prs</span>{" "}
                      (1 ctn)
                    </div>
                  </TableCell>

                  {/* Variants */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1">
                      {p.colorVariants?.slice(0, 3).map((col, idx) => (
                        <div
                          key={idx}
                          className="h-4 w-4 rounded-full border border-white/20"
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                      {(p.colorVariants?.length || 0) > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{(p.colorVariants?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {/* BUG-17 FIX: Only show "..." when sizes are actually truncated. */}
                      Sizes: {p.sizes?.slice(0, 4).join(", ")}
                      {(p.sizes?.length ?? 0) > 4 ? "..." : ""}
                    </div>
                  </TableCell>

                  {/* Status & Badges */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.inStock ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                          IN STOCK
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                          MADE TO ORDER
                        </Badge>
                      )}

                      {p.featured && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                          ⭐ Featured
                        </Badge>
                      )}
                      {p.bestseller && (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]">
                          🏷️ Bestseller
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditProduct(p)}
                        className="h-8 w-8 p-0 text-slate-300 hover:text-amber-400 hover:bg-slate-800"
                        title="Edit Product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setProductToDelete(p)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" /> Confirm Product Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to permanently delete <strong>"{productToDelete?.name}"</strong>{" "}
              (SKU: {productToDelete?.sku})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
