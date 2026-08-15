import { useState, useRef, MouseEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { Play, ShieldCheck, Image as ImageIcon, ZoomIn, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  product: Product;
  selectedColorImage?: string;
}

export function ProductGallery({ product, selectedColorImage }: ProductGalleryProps) {
  const [activeMedia, setActiveMedia] = useState<"photo" | "video">("photo");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayImages = product.images.length > 0 ? product.images : [product.image];
  const hasVideo = !!product.video;

  // When selectedColorImage changes from parent, switch to photo mode and update active image
  useEffect(() => {
    if (selectedColorImage) {
      const idx = displayImages.indexOf(selectedColorImage);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
      setActiveMedia("photo");
    }
  }, [selectedColorImage, displayImages]);

  // Current active image derived strictly from activeIndex
  const currentImage = displayImages[activeIndex] || displayImages[0];

  // Keyboard accessibility for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, activeIndex, activeMedia]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handlePrev = () => {
    if (activeMedia === "video") {
      setActiveMedia("photo");
      setActiveIndex(displayImages.length - 1);
    } else {
      if (activeIndex === 0 && hasVideo) {
        setActiveMedia("video");
      } else {
        setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
      }
    }
  };

  const handleNext = () => {
    if (activeMedia === "video") {
      setActiveMedia("photo");
      setActiveIndex(0);
    } else {
      if (activeIndex === displayImages.length - 1 && hasVideo) {
        setActiveMedia("video");
      } else {
        setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
      }
    }
  };

  const handleThumbnailClick = (idx: number) => {
    if (activeIndex === idx && activeMedia === "photo") {
      setIsLightboxOpen(true);
    } else {
      setActiveIndex(idx);
      setActiveMedia("photo");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Media Mode Switcher (Photos vs Video) ── */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl bg-muted/80 p-1 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveMedia("photo")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
              activeMedia === "photo"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Photos ({displayImages.length})
          </button>
          {hasVideo && (
            <button
              type="button"
              onClick={() => setActiveMedia("video")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeMedia === "video"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              HD Video Demo
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          SKU: {product.sku}
        </span>
      </div>

      {/* Main Gallery Area */}
      <div className="flex flex-col lg:flex-row gap-4 relative">
        {/* Desktop Vertical Thumbnails */}
        <div className="hidden lg:flex flex-col gap-2 w-16 shrink-0">
          {displayImages.map((img, idx) => {
            const isSelected = activeMedia === "photo" && activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleThumbnailClick(idx)}
                className={cn(
                  "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 ring-offset-1 scale-105 opacity-100"
                    : "border-border/60 hover:border-border opacity-80 hover:opacity-100"
                )}
                title={`View photo ${idx + 1} (click again to expand full screen)`}
              >
                <img src={img} alt={`${product.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                )}
              </button>
            );
          })}

          {/* Video Thumbnail Button */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => setActiveMedia("video")}
              className={cn(
                "relative w-16 h-16 rounded-xl overflow-hidden border-2 bg-neutral-950 text-white flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group",
                activeMedia === "video" ? "border-amber-500 ring-2 ring-amber-500/40" : "border-border/60 hover:border-amber-500/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-black group-hover:scale-110 transition-transform">
                <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Video</span>
            </button>
          )}
        </div>

        {/* Mobile Horizontal Thumbnails */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 order-2 scrollbar-none w-full">
          {displayImages.map((img, idx) => {
            const isSelected = activeMedia === "photo" && activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleThumbnailClick(idx)}
                className={cn(
                  "relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer",
                  isSelected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/60 opacity-80"
                )}
              >
                <img src={img} alt={`${product.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            );
          })}

          {hasVideo && (
            <button
              type="button"
              onClick={() => setActiveMedia("video")}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded-xl border-2 bg-neutral-950 text-white flex flex-col items-center justify-center gap-1 cursor-pointer",
                activeMedia === "video" ? "border-amber-500" : "border-border/60"
              )}
            >
              <Play className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-[9px] font-bold text-amber-400">Video</span>
            </button>
          )}
        </div>

        {/* Main Viewport */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
          onClick={() => {
            if (activeMedia === "photo") {
              setIsLightboxOpen(true);
            }
          }}
          className="group relative aspect-square w-full lg:w-[calc(100%-4.5rem)] rounded-2xl overflow-hidden border border-border bg-muted/30 order-1 select-none cursor-pointer"
        >
          {activeMedia === "video" && hasVideo ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src={product.video}
                autoPlay
                muted
                controls
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-200"
                style={
                  isZooming
                    ? {
                        transform: "scale(1.8)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : { transform: "scale(1)" }
                }
              />

              {/* Hover & Fullscreen hints */}
              {!isZooming && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                    <span>Hover to zoom (2x)</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-bold text-primary-foreground backdrop-blur-md shadow-lg group-hover:scale-105 transition-transform">
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Click to Expand</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background cursor-pointer"
            aria-label="Previous media"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background cursor-pointer"
            aria-label="Next media"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Trust Row */}
      <div className="flex items-center gap-3 text-sm flex-wrap mt-1">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Anamon Verified Supplier</span>
        </div>
        <span className="text-muted-foreground text-xs">•</span>
        <span className="text-muted-foreground text-xs">Sample available</span>
        <span className="text-muted-foreground text-xs">•</span>
        <span className="text-muted-foreground text-xs">Inspected factory</span>
      </div>

      {/* ━━━━━━ Fullscreen Lightbox Modal Portal ━━━━━━ */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                className="fixed inset-0 bg-black/95 backdrop-blur-xl"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Main Lightbox Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex flex-col items-center justify-center max-w-5xl max-h-[85vh] w-full h-full select-none"
              >
                {activeMedia === "video" && hasVideo ? (
                  <video
                    src={product.video}
                    controls
                    autoPlay
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain"
                  />
                ) : (
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
                  />
                )}

                {/* Lightbox Navigation Controls */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Lightbox Footer Bar */}
                <div className="mt-4 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-white text-xs font-semibold">
                  <span>{product.name}</span>
                  <span className="opacity-50">•</span>
                  <span>{activeMedia === "photo" ? `Photo ${activeIndex + 1} of ${displayImages.length}` : "HD Video"}</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
