import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Tag,
  Layers,
  Palette,
  Image as ImageIcon,
  FileVideo,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Hash,
  Globe,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Product, CATEGORIES } from "@/data/products";

interface ProductManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (productData: Partial<Product>) => void;
}

const DEFAULT_SIZES = ["6", "7", "8", "9", "10", "11", "12"];

export function ProductManageModal({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}: ProductManageModalProps) {
  const isEditing = !!productToEdit;

  // Form State
  const [activeFormTab, setActiveFormTab] = useState("basic");

  // Tab 1: Basic Info & SEO
  const [name, setName] = useState("");
  const [nameUrdu, setNameUrdu] = useState("");
  const [sku, setSku] = useState("");
  const [categorySlug, setCategorySlug] = useState("men-formal");
  const [subcategory, setSubcategory] = useState("");
  const [gender, setGender] = useState<"men" | "women" | "kids" | "unisex">("men");
  const [material, setMaterial] = useState("Full-grain genuine leather");
  const [soleType, setSoleType] = useState("Rubber");
  const [description, setDescription] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("10–14 days");
  const [productionCapacity, setProductionCapacity] = useState("10,000 pairs/month");
  const [tags, setTags] = useState("leather, wholesale, formal, Oxford");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Tab 2: Pricing, MOQ & Cartons
  const [basePrice, setBasePrice] = useState(1850);
  const [retailPrice, setRetailPrice] = useState(2800);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(20);
  const [moq, setMoq] = useState(12);
  const [cartonQty, setCartonQty] = useState(12);
  const [singleColorPerCarton, setSingleColorPerCarton] = useState(true);

  // Price Tiers State
  const [priceTiers, setPriceTiers] = useState<
    { moq: number; pricePerPair: number; label: string }[]
  >([
    { moq: 12, pricePerPair: 1850, label: "Starter (1-4 Ctns)" },
    { moq: 60, pricePerPair: 1650, label: "Dealer (5-19 Ctns)" },
    { moq: 240, pricePerPair: 1450, label: "Wholesale (20-49 Ctns)" },
    { moq: 600, pricePerPair: 1250, label: "Bulk Master (50+ Ctns)" },
  ]);

  // Tab 3: Color & Size Variants
  const [colorVariants, setColorVariants] = useState<
    { name: string; hex: string; inStock: boolean; stockUnits: number; image?: string }[]
  >([
    { name: "Black", hex: "#1C1C1C", inStock: true, stockUnits: 1200 },
    { name: "Tan", hex: "#C4906B", inStock: true, stockUnits: 900 },
    { name: "Coffee", hex: "#6B3A2A", inStock: true, stockUnits: 600 },
  ]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(DEFAULT_SIZES);

  // New Variant Input Temp State
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#1C1C1C");
  const [newColorStock, setNewColorStock] = useState("500");

  // Tab 4: Media & Documents
  const [mainImage, setMainImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sizeChartUrl, setSizeChartUrl] = useState("");
  const [techDocUrl, setTechDocUrl] = useState("");

  // Tab 5: Inventory & Badges
  const [inStock, setInStock] = useState(true);
  const [stockStatus, setStockStatus] = useState<"IN_STOCK" | "LOW_STOCK" | "MADE_TO_ORDER" | "OUT_OF_STOCK">("IN_STOCK");
  const [totalStockUnits, setTotalStockUnits] = useState(2700);
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [trending, setTrending] = useState(false);
  const [newArrival, setNewArrival] = useState(false);

  // Populate form when editing an existing product, or reset when creating a new one.
  // BUG-16 FIX: Depend only on [productToEdit] so the form is not re-initialised
  // every time the modal opens or closes — which caused mid-edit data loss and
  // state updates on an already-unmounted/closing modal.
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setNameUrdu(productToEdit.nameUrdu || "");
      setSku(productToEdit.sku || "");
      setCategorySlug(productToEdit.categorySlug || "men-formal");
      setGender(productToEdit.gender || "men");
      setMaterial(productToEdit.material || "");
      setSoleType(productToEdit.soleType || "");
      setDescription(productToEdit.description || "");
      setLeadTimeDays(productToEdit.leadTimeDays || "10–14 days");
      setProductionCapacity(productToEdit.productionCapacity || "10,000 pairs/month");

      if (productToEdit.priceTiers && productToEdit.priceTiers.length > 0) {
        setPriceTiers(productToEdit.priceTiers);
        setBasePrice(productToEdit.priceTiers[0].pricePerPair);
      }
      setMoq(productToEdit.moq || 12);
      setCartonQty(productToEdit.cartonQty || 12);

      if (productToEdit.colorVariants) {
        setColorVariants(productToEdit.colorVariants);
      }
      if (productToEdit.sizes) {
        setSelectedSizes(productToEdit.sizes);
      }

      setMainImage(productToEdit.image || "");
      setGalleryImages(productToEdit.images || []);
      setVideoUrl(productToEdit.video || "");

      setInStock(productToEdit.inStock !== false);
      setFeatured(!!productToEdit.featured);
      setBestseller(!!productToEdit.bestseller);
      setTrending(!!productToEdit.trending);
      setNewArrival(!!productToEdit.newArrival);
      setIsPublished(true);
    } else {
      // Reset defaults for new product
      setName("");
      setNameUrdu("");
      setSku(`SHR-${Math.floor(100 + Math.random() * 900)}`);
      setCategorySlug("men-formal");
      setDescription("");
      setMainImage("https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800&auto=format&fit=crop");
      setGalleryImages([
        "https://images.unsplash.com/photo-1614252369475-531eda835eb1?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop"
      ]);
      setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    }
  }, [productToEdit]);

  // Reset the active form tab back to "basic" each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setActiveFormTab("basic");
    }
  }, [isOpen]);

  // Handlers for Price Tiers
  const handleAddTier = () => {
    const nextMoq = (priceTiers[priceTiers.length - 1]?.moq || 0) + 60;
    setPriceTiers([
      ...priceTiers,
      { moq: nextMoq, pricePerPair: 1200, label: `Tier ${priceTiers.length + 1}` },
    ]);
  };

  const handleUpdateTier = (idx: number, field: string, val: any) => {
    const updated = [...priceTiers];
    updated[idx] = { ...updated[idx], [field]: val };
    setPriceTiers(updated);
  };

  const handleRemoveTier = (idx: number) => {
    if (priceTiers.length <= 1) {
      toast.error("At least one price tier is required");
      return;
    }
    setPriceTiers(priceTiers.filter((_, i) => i !== idx));
  };

  // Handlers for Color Variants
  const handleAddColor = () => {
    if (!newColorName) {
      toast.error("Please enter color name");
      return;
    }
    setColorVariants([
      ...colorVariants,
      {
        name: newColorName,
        hex: newColorHex,
        inStock: true,
        stockUnits: parseInt(newColorStock, 10) || 500,
      },
    ]);
    setNewColorName("");
    toast.success(`Color ${newColorName} added`);
  };

  const handleRemoveColor = (idx: number) => {
    if (colorVariants.length <= 1) {
      toast.error("At least one color variant is required");
      return;
    }
    setColorVariants(colorVariants.filter((_, i) => i !== idx));
  };

  // Handlers for Image Gallery
  const handleAddGalleryImage = () => {
    if (!newImageUrl) return;
    setGalleryImages([...galleryImages, newImageUrl]);
    setNewImageUrl("");
    toast.success("Image URL added to gallery");
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!sku.trim()) {
      toast.error("SKU code is required");
      return;
    }
    if (moq < 12 || moq % 12 !== 0) {
      toast.error("MOQ must be 12 pairs or a multiple of 12");
      return;
    }

    const lowestPrice = priceTiers[priceTiers.length - 1]?.pricePerPair ?? basePrice;
    const highestPrice = priceTiers[0]?.pricePerPair ?? basePrice;

    const payload: Partial<Product> = {
      slug: productToEdit?.slug || sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku: sku.toUpperCase(),
      name,
      nameUrdu,
      categorySlug,
      gender,
      material,
      soleType,
      image: mainImage || galleryImages[0] || "",
      images: galleryImages.length > 0 ? galleryImages : [mainImage],
      video: videoUrl,
      colorVariants,
      colors: colorVariants.map((c) => c.name),
      sizes: selectedSizes,
      moq,
      cartonQty: 12,
      priceTiers,
      leadTimeDays,
      productionCapacity,
      // BUG-11 FIX: Use toLocaleString() so numbers have thousands-separating commas
      // (e.g. "PKR 1,250–1,850" instead of "PKR 1250–1850"), matching the rest of the UI.
      priceLabel: lowestPrice === highestPrice
        ? `PKR ${lowestPrice.toLocaleString()}`
        : `PKR ${lowestPrice.toLocaleString()}–${highestPrice.toLocaleString()}`,
      inStock,
      featured,
      bestseller,
      trending,
      newArrival,
      description,
      specifications: {
        "Upper Material": material,
        "Sole Material": soleType,
        "Gender": gender,
        "Minimum Order": `${moq} pairs (1 carton)`,
        "Packaging": `${cartonQty} pairs per carton (Single color)`,
        "Origin": "Lahore / Sialkot, Pakistan",
      },
      shippingInfo: `Shipped in standard cartons of ${cartonQty} pairs. Single color per carton.`,
    };

    onSave(payload);
    onClose();
    toast.success(
      isEditing
        ? `Product "${name}" updated successfully!`
        : `New product "${name}" created and published!`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-100">
                  {isEditing ? `Edit Product: ${productToEdit?.name}` : "Create & Publish New Product"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Full admin control over specs, MOQ, pricing tiers, variants & media.
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Admin Master Editor
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="w-full">
            <TabsList className="grid grid-cols-5 bg-slate-950 border border-slate-800 p-1 rounded-xl mb-6">
              <TabsTrigger value="basic" className="text-xs font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                Basic & SEO
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                Pricing & MOQ
              </TabsTrigger>
              <TabsTrigger value="variants" className="text-xs font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                Colors & Sizes
              </TabsTrigger>
              <TabsTrigger value="media" className="text-xs font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                Media & Docs
              </TabsTrigger>
              <TabsTrigger value="status" className="text-xs font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                Status & Badges
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: BASIC INFO & SEO ── */}
            <TabsContent value="basic" className="space-y-4 focus:outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Product Name (English) *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Executive Oxford Leather Shoe"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Product Name (Urdu / Urdu Title)</label>
                  <Input
                    value={nameUrdu}
                    onChange={(e) => setNameUrdu(e.target.value)}
                    placeholder="e.g. آکسفورڈ فارمل لیدر"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-urdu text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">SKU Code *</label>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ANM-OXF-101"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Category *</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug} className="bg-slate-900 text-slate-100">
                        {c.name} ({c.gender})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Gender Target</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="men" className="bg-slate-900">Men</option>
                    <option value="women" className="bg-slate-900">Women</option>
                    <option value="kids" className="bg-slate-900">Kids</option>
                    <option value="unisex" className="bg-slate-900">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Upper Material Specification</label>
                  <Input
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Full-grain cow leather"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Sole Material Specification</label>
                  <Input
                    value={soleType}
                    onChange={(e) => setSoleType(e.target.value)}
                    placeholder="High-Density Rubber / PU Sole"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Product Description & Copywriter Details</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of craftsmanship, stitching, leather quality, and target retail market..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              {/* SEO Block */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Globe className="h-4 w-4" /> SEO & Search Metadata
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Meta Search Title</label>
                    <Input
                      value={metaTitle || name}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Product SEO Title"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Search Tags (comma separated)</label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="leather, oxford, formal, bulk"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 2: PRICING, MOQ & CARTONS ── */}
            <TabsContent value="pricing" className="space-y-4 focus:outline-none">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Package className="h-4 w-4" /> Wholesale Packing & MOQ Rules (Factory Standard)
                </div>
                <p className="text-xs text-slate-300">
                  Minimum Order Quantity is locked to <strong>12 pairs (1 carton)</strong>. Orders must be in multiples of <strong>12 pairs</strong> only. All 12 pairs in a carton must be of a single color.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Minimum Order Quantity (MOQ) *</label>
                  <Input
                    type="number"
                    step={12}
                    min={12}
                    value={moq}
                    onChange={(e) => setMoq(parseInt(e.target.value, 10) || 12)}
                    className="bg-slate-950 border-slate-800 font-mono text-slate-100"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Multiples of 12 only (12, 24, 36, 48...)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Carton Packing Quantity</label>
                  <Input
                    type="number"
                    value={cartonQty}
                    onChange={(e) => setCartonQty(parseInt(e.target.value, 10) || 12)}
                    className="bg-slate-950 border-slate-800 font-mono text-slate-100"
                    readOnly
                  />
                  <span className="text-[10px] text-emerald-400">Fixed: 12 pairs per carton</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Retail MSRP (PKR)</label>
                  <Input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseInt(e.target.value, 10) || 0)}
                    className="bg-slate-950 border-slate-800 font-mono text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400">Estimated end-user price</span>
                </div>
              </div>

              {/* Tiered Wholesale Volume Pricing Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Tiered Volume Pricing Tiers
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddTier}
                    className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs h-8 gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Pricing Tier
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                      <tr>
                        <th className="p-3">Min Order (Pairs)</th>
                        <th className="p-3">Cartons Equivalent</th>
                        <th className="p-3">Price / Pair (PKR)</th>
                        <th className="p-3">Tier Label</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {priceTiers.map((tier, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-mono">
                            <Input
                              type="number"
                              step={12}
                              value={tier.moq}
                              onChange={(e) =>
                                handleUpdateTier(idx, "moq", parseInt(e.target.value, 10) || 12)
                              }
                              className="w-24 h-8 bg-slate-900 border-slate-800 text-xs"
                            />
                          </td>
                          <td className="p-3 font-mono text-slate-400">
                            {Math.round(tier.moq / 12)} Ctn{Math.round(tier.moq / 12) > 1 ? "s" : ""}
                          </td>
                          <td className="p-3 font-mono">
                            <Input
                              type="number"
                              value={tier.pricePerPair}
                              onChange={(e) =>
                                handleUpdateTier(idx, "pricePerPair", parseInt(e.target.value, 10) || 0)
                              }
                              className="w-28 h-8 bg-slate-900 border-slate-800 text-xs font-bold text-amber-400"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={tier.label}
                              onChange={(e) => handleUpdateTier(idx, "label", e.target.value)}
                              className="w-36 h-8 bg-slate-900 border-slate-800 text-xs"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTier(idx)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 3: COLORS & SIZES ── */}
            <TabsContent value="variants" className="space-y-5 focus:outline-none">
              {/* Color Variants Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Product Color Variants
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Each carton contains 12 pairs of a single color
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {colorVariants.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-7 w-7 rounded-full border border-white/20 shadow-inner shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-100 block">{col.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Hex: {col.hex} • {col.stockUnits} units
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveColor(idx)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Color Row */}
                <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <Input
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color Name (e.g. Coffee Brown)"
                    className="bg-slate-900 border-slate-800 text-xs flex-1"
                  />
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg shrink-0">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="h-6 w-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{newColorHex}</span>
                  </div>
                  <Input
                    type="number"
                    value={newColorStock}
                    onChange={(e) => setNewColorStock(e.target.value)}
                    placeholder="Stock"
                    className="bg-slate-900 border-slate-800 text-xs w-24"
                  />
                  <Button
                    type="button"
                    onClick={handleAddColor}
                    className="bg-amber-500 text-slate-950 font-bold text-xs h-9"
                  >
                    Add Color
                  </Button>
                </div>
              </div>

              {/* Size Run Manager */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Available Size Run Matrix (EU/UK Standard)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {["5", "6", "7", "8", "9", "10", "11", "12", "13"].map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSizes(selectedSizes.filter((s) => s !== sz));
                          } else {
                            setSelectedSizes([...selectedSizes, sz]);
                          }
                        }}
                        className={`h-10 w-12 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 4: MEDIA & DOCUMENTS ── */}
            <TabsContent value="media" className="space-y-4 focus:outline-none">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Main Cover Image URL *</label>
                <Input
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-slate-950 border-slate-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Gallery Image URLs</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-950 border-slate-800 text-xs font-mono flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Add Image
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {galleryImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl border border-slate-800 overflow-hidden bg-slate-950"
                    >
                      <img src={url} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Product HD Demo Video URL</label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/..."
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Tech Specification Sheet / Size Chart PDF URL</label>
                  <Input
                    value={techDocUrl}
                    onChange={(e) => setTechDocUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 5: STATUS & BADGES ── */}
            <TabsContent value="status" className="space-y-5 focus:outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Publication Status</label>
                  <select
                    value={isPublished ? "PUBLISHED" : "DRAFT"}
                    onChange={(e) => setIsPublished(e.target.value === "PUBLISHED")}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="PUBLISHED">Published (Visible on Marketplace)</option>
                    <option value="DRAFT">Draft / Unpublished</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Inventory Status</label>
                  <select
                    value={inStock ? "IN_STOCK" : "OUT_OF_STOCK"}
                    onChange={(e) => setInStock(e.target.value === "IN_STOCK")}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="IN_STOCK">In Stock & Ready for Dispatch</option>
                    <option value="OUT_OF_STOCK">Made to Order / Lead Time Only</option>
                  </select>
                </div>
              </div>

              {/* Promotional Flags */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Promotional Badges & Catalog Placement
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "⭐ Featured Product", state: featured, setState: setFeatured },
                    { label: "🏷️ Best Seller", state: bestseller, setState: setBestseller },
                    { label: "🔥 Trending", state: trending, setState: setTrending },
                    { label: "🆕 New Arrival", state: newArrival, setState: setNewArrival },
                  ].map((badge, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => badge.setState(!badge.state)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        badge.state
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      <span>{badge.label}</span>
                      {badge.state && <Check className="h-4 w-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-800 text-slate-400 hover:bg-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6"
            >
              {isEditing ? "Save & Update Product" : "Publish Product to Marketplace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
