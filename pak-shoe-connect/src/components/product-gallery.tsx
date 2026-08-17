import { useState, useRef, useEffect } from "react";
import { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Zoom } from "swiper/modules";
import {
  Heart,
  Share2,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Play,
  Maximize2,
} from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/data/products";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/zoom";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.slug);

  const [activeTab, setActiveTab] = useState<"video" | "photos">(
    product.video ? "video" : "photos",
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const thumbPrevRef = useRef<HTMLButtonElement>(null);
  const thumbNextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTab === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (activeTab === "photos" && videoRef.current) {
      videoRef.current.pause();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-3">
      {/* Gallery Area */}
      <div className="flex flex-row gap-3 h-[400px] sm:h-[480px]">
        {/* Vertical Thumbnails */}
        <div className="w-[60px] sm:w-[70px] flex-shrink-0 flex flex-col relative h-full">
          <button
            ref={thumbPrevRef}
            className="z-10 bg-white/80 hover:bg-white text-gray-700 rounded-md p-1 shadow-sm transition disabled:opacity-30 absolute top-0 left-0 right-0 flex justify-center pb-1"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <div className="flex-1 py-8 overflow-hidden">
            <Swiper
              onSwiper={setThumbsSwiper}
              direction="vertical"
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              navigation={{
                prevEl: thumbPrevRef.current,
                nextEl: thumbNextRef.current,
              }}
              onInit={(swiper) => {
                // @ts-ignore
                swiper.params.navigation.prevEl = thumbPrevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = thumbNextRef.current;
                swiper.navigation.init();
                swiper.navigation.update();
              }}
              className="h-full w-full custom-thumbs"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index} className="cursor-pointer !h-[60px] sm:!h-[70px]">
                  <div className="w-full h-full rounded-md border-2 border-transparent transition-all overflow-hidden bg-white hover:border-primary/50 [&.swiper-slide-thumb-active]:border-primary">
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover p-0.5"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button
            ref={thumbNextRef}
            className="z-10 bg-white/80 hover:bg-white text-gray-700 rounded-md p-1 shadow-sm transition disabled:opacity-30 absolute bottom-0 left-0 right-0 flex justify-center pt-1"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Main View */}
        <div className="flex-1 relative rounded-lg overflow-hidden border border-border bg-gray-50 h-full flex flex-col">
          {activeTab === "video" && product.video ? (
            <div className="w-full h-full bg-black relative flex items-center justify-center">
              <video
                ref={videoRef}
                src={product.video}
                className="w-full h-full object-contain"
                controls
                muted
                loop
                playsInline
              />
            </div>
          ) : (
            <div className="w-full h-full relative">
              <Swiper
                style={
                  {
                    "--swiper-navigation-color": "#FF6A00",
                    "--swiper-pagination-color": "#FF6A00",
                  } as any
                }
                zoom={true}
                spaceBetween={10}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onInit={(swiper) => {
                  // @ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  // @ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[FreeMode, Navigation, Thumbs, Zoom]}
                className="w-full h-full"
              >
                {product.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="swiper-zoom-container h-full w-full flex items-center justify-center p-2 bg-white">
                      <img
                        src={img}
                        alt={`${product.name} - view ${index + 1}`}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                ref={prevRef}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-gray-700 rounded-full p-2 shadow-md transition disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                ref={nextRef}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-gray-700 rounded-full p-2 shadow-md transition disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Top Right Icons */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={() => toggleItem(product)}
              className={`p-2.5 rounded-full bg-white shadow-md hover:scale-105 transition ${
                wishlisted ? "text-primary" : "text-gray-500 hover:text-primary"
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} />
            </button>
            {activeTab === "photos" && (
              <button className="p-2.5 rounded-full bg-white shadow-md hover:scale-105 transition text-gray-500 hover:text-primary">
                <Maximize2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs (Photos / Video) */}
      <div className="flex justify-center mt-1">
        <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-6 py-1 text-sm font-semibold rounded-full transition-colors ${activeTab === "photos" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Photos
          </button>
          {product.video && (
            <button
              onClick={() => setActiveTab("video")}
              className={`px-6 py-1 text-sm font-semibold rounded-full transition-colors flex items-center gap-1 ${activeTab === "video" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Play className="w-3.5 h-3.5" /> Video
            </button>
          )}
        </div>
      </div>

      {/* Supplier Bar */}
      <div className="mt-2 bg-[#F2F7FD] rounded-lg p-3 flex items-center gap-3 border border-[#E3EEFA]">
        <div className="w-10 h-10 bg-white rounded-md overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
          <img
            src="https://api.dicebear.com/7.x/initials/svg?seed=Anamon&backgroundColor=003366&textColor=ffffff"
            alt="Supplier Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm truncate hover:text-primary cursor-pointer">
              Anamon Footwear Pvt. Ltd.
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div> Verified Manufacturer
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
            <span className="flex items-center gap-1">
              <img src="https://flagcdn.com/w20/pk.png" alt="Pakistan" className="w-3.5 h-2.5" />{" "}
              Lahore, PK
            </span>
            <span className="text-gray-300">•</span>
            <span>25+ yrs</span>
            <span className="text-gray-300">•</span>
            <span className="truncate">Manufacturer & Exporter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
