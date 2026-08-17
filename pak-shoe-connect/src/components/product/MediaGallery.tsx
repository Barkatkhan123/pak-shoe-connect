import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  Image as ImageIcon,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
} from "lucide-react";
import type { EnterpriseProduct } from "@/types/product";
import { ProductVideoPlayer } from "./ProductVideoPlayer";

interface MediaGalleryProps {
  product: EnterpriseProduct;
  selectedColorImage?: string;
}

export function MediaGallery({ product, selectedColorImage }: MediaGalleryProps) {
  const [activeMedia, setActiveMedia] = useState<"photos" | "video">("photos");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const images = product.media.images.length > 0 ? product.media.images : [product.media.mainImage];
  const videos = product.media.videos;

  // Sync selected color image to activeImageIdx
  useEffect(() => {
    if (selectedColorImage) {
      const idx = images.indexOf(selectedColorImage);
      if (idx !== -1) {
        setActiveImageIdx(idx);
      }
      setActiveMedia("photos");
    }
  }, [selectedColorImage, images]);

  // Current active image derived strictly from activeImageIdx
  const currentImage = images[activeImageIdx] || images[0];

  // Keyboard support for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, activeImageIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (idx: number) => {
    if (activeImageIdx === idx && activeMedia === "photos") {
      // If already active photo clicked, open Lightbox preview
      setIsLightboxOpen(true);
    } else {
      setActiveImageIdx(idx);
      setActiveMedia("photos");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top Media Mode Switcher (Photos vs Video Tour) ── */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl bg-secondary/80 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveMedia("photos")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeMedia === "photos"
                ? "bg-white text-foreground shadow-sm dark:bg-neutral-800"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Photos ({images.length})
          </button>
          {videos && videos.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveMedia("video")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeMedia === "video"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              HD Video Studio ({videos.length})
            </button>
          )}
        </div>

        {/* Stock status pill */}
        <div className="flex items-center gap-1.5">
          {product.inventory.inStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> In Stock (
              {product.inventory.stock.toLocaleString()}+ pairs)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-3 w-3" /> Made to Order
            </span>
          )}
        </div>
      </div>

      {/* ── Main Media Display Container ── */}
      {activeMedia === "video" ? (
        <ProductVideoPlayer
          videos={videos}
          initialActiveIndex={activeVideoIdx}
          onVideoChange={(idx) => setActiveVideoIdx(idx)}
        />
      ) : (
        <div className="flex flex-col-reverse md:flex-row gap-3">
          {/* Vertical Thumbnails (Desktop) / Horizontal (Mobile) */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[460px] scrollbar-thin py-1">
            {images.map((img, idx) => {
              const isSelected = idx === activeImageIdx && activeMedia === "photos";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/30 scale-105 shadow-md opacity-100"
                      : "border-border/60 hover:border-foreground/30 opacity-70 hover:opacity-100"
                  }`}
                  title={`View photo ${idx + 1} (click again to expand full screen)`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                  )}
                </button>
              );
            })}

            {/* Video Thumbnail Shortcut Button */}
            {videos && videos.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveMedia("video")}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-amber-500/50 bg-neutral-900 text-white flex flex-col items-center justify-center gap-1 hover:border-amber-500 transition-all group cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-black group-hover:scale-110 transition-transform">
                  <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase text-amber-400">
                  Video
                </span>
              </button>
            )}
          </div>

          {/* ── High-Res Image Viewport with Hover Zoom & Click Fullscreen Lightbox ── */}
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
            className="group relative flex-1 aspect-square md:aspect-[4/3] max-h-[460px] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 shadow-inner select-none cursor-pointer"
          >
            {/* Discount Badge */}
            {product.pricing.discount > 0 && (
              <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
                <Flame className="h-3.5 w-3.5 fill-current" />
                {product.pricing.discount}% OFF
              </div>
            )}

            {/* SKU Badge */}
            <div className="absolute right-3 top-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-mono font-medium text-white/90 backdrop-blur-md">
              {product.sku}
            </div>

            {/* Main Interactive Zoom Image */}
            <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.title}
                className="h-full w-full object-contain p-4 transition-transform duration-200"
                style={
                  isZooming
                    ? {
                        transform: "scale(1.8)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : { transform: "scale(1)" }
                }
              />
            </div>

            {/* Zoom & Expand hint banners */}
            {!isZooming && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hover to zoom (2x)</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-black shadow-md group-hover:scale-105 transition-transform">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Click Fullscreen</span>
                </div>
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-800 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-foreground shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-800 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal Portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isLightboxOpen && (
              <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsLightboxOpen(false)}
                  className="fixed inset-0 bg-black/95 backdrop-blur-xl"
                />

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                  aria-label="Close Lightbox"
                >
                  <X className="h-6 w-6" />
                </button>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 flex flex-col items-center justify-center max-w-5xl max-h-[85vh] w-full h-full select-none"
                >
                  <img
                    src={currentImage}
                    alt={product.title}
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
                  />

                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all cursor-pointer"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all cursor-pointer"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  <div className="mt-4 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-white text-xs font-semibold">
                    <span>{product.title}</span>
                    <span className="opacity-50">•</span>
                    <span>
                      Photo {activeImageIdx + 1} of {images.length}
                    </span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
