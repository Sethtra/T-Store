import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useProduct, type Product } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { getImageUrl } from "../utils/image";
import { useTranslation } from "react-i18next";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { data, isLoading, error } = useProduct(slug || "");
  const product = data?.product;
  const relatedFromBundle = data?.related;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Open lightbox at specific image
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || !product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIndex((i) => Math.min(i + 1, product.images.length - 1));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isLightboxOpen, product, closeLightbox]);

  // Swipe handler for lightbox
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!product) return;
      const threshold = 50;
      if (info.offset.x < -threshold) {
        setLightboxIndex((i) => Math.min(i + 1, product.images.length - 1));
      } else if (info.offset.x > threshold) {
        setLightboxIndex((i) => Math.max(i - 1, 0));
      }
    },
    [product],
  );

  // Attribute selections
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (): boolean => {
    if (!product) return false;

    // Optional: Validate selection if attributes exist
    const colors = getAttributeValues("Color");
    const sizes = getAttributeValues("Size");

    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color");
      return false;
    }
    if (sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return false;
    }

    for (let i = 0; i < quantity; i++) {
      const attributes: Record<string, string> = {
        ...(selectedColor ? { Color: selectedColor } : {}),
        ...(selectedSize ? { Size: selectedSize } : {}),
      };

      addItem({
        id: product.id,
        slug: product?.slug,
        title: product.title,
        price: product.price,
        image: product.images[0] || "/placeholder.jpg",
        attributes,
      });
    }
    openCart();
    return true;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (added) {
      navigate("/checkout");
    }
  };

  // Helper to safely get attribute values as array
  const getAttributeValues = (keyName: string): string[] => {
    if (!product?.attributes) return [];

    const key = Object.keys(product.attributes).find(
      (k) => k.toLowerCase() === keyName.toLowerCase(),
    );
    if (!key) return [];

    const value = product.attributes[key];
    if (Array.isArray(value)) return value;
    if (typeof value === "string")
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    return [];
  };

  // Color mapping for visuals
  const getColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#22c55e",
      black: "#000000",
      white: "#ffffff",
      yellow: "#eab308",
      purple: "#a855f7",
      pink: "#ec4899",
      gray: "#6b7280",
      grey: "#6b7280",
      orange: "#f97316",
      navy: "#1e3a8a",
      beige: "#d4d4d8",
      brown: "#78350f",
      gold: "#ca8a04",
      silver: "#9ca3af",
    };
    return colors[colorName.toLowerCase()] || colorName;
  };

  if (isLoading) {
    return (
      <div className="container pb-16" style={{ paddingTop: "128px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-32 skeleton rounded" />
            <div className="h-10 w-3/4 skeleton rounded" />
            <div className="h-24 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        className="container pb-16 text-center"
        style={{ paddingTop: "128px" }}
      >
        <h1 className="text-2xl font-bold mb-4">{t("product.not_found")}</h1>
        <Button onClick={() => navigate("/products")}>{t("product.browse_products")}</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const colors = getAttributeValues("Color");
  const sizes = getAttributeValues("Size");

  return (
    <div className="container pb-16" style={{ paddingTop: "128px" }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
        <button
          onClick={() => navigate("/")}
          className="hover:text-[var(--color-text-primary)]"
        >
          {t("nav.home")}
        </button>
        <span>/</span>
        <button
          onClick={() => navigate("/products")}
          className="hover:text-[var(--color-text-primary)]"
        >
          {t("products.title")}
        </button>
        <span>/</span>
        <span className="text-[var(--color-text-primary)] font-medium">
          {isKh ? product.title_kh || product.title : product.title}
        </span>
      </nav>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Image Gallery - Span 8 (Left) */}
        <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 h-auto">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex lg:grid lg:grid-cols-1 lg:grid-rows-4 gap-2 lg:gap-4 shrink-0 w-full lg:w-36 h-auto lg:h-full order-2 lg:order-1 overflow-x-auto pb-1 lg:pb-0">
              {product.images.slice(0, 4).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-16 h-16 lg:w-full lg:h-full rounded-xl overflow-hidden border-2 transition-all bg-[var(--color-bg-secondary)] ${
                    selectedImage === index
                      ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div
            className="flex-1 relative rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] group aspect-square lg:aspect-auto lg:min-h-[600px] lg:h-full order-1 lg:order-2 cursor-zoom-in"
            onClick={() => openLightbox(selectedImage)}
          >
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={getImageUrl(product.images[selectedImage])}
              alt={product.title}
              className="w-full h-full object-contain p-4 lg:p-8"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
                e.currentTarget.onerror = null;
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {t("product.out_of_stock")}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 lg:hidden bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              {t("product.tap_to_view")}
            </div>
          </div>
        </div>

        {/* Product Info - Span 4 (Right) */}
        <div className="lg:col-span-4 flex flex-col pt-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              {product.category && (
                <span className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                  {isKh && product.category.name_kh ? product.category.name_kh : product.category.name}
                </span>
              )}
              <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                 <span className="ml-1 text-xs px-2 py-1 bg-[var(--color-bg-elevated)] rounded">{t("product.no_reviews")}</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-[var(--color-text-primary)] mb-4">
              {isKh ? product.title_kh || product.title : product.title}
            </h1>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[var(--color-text-primary)]">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="h-px bg-[var(--color-border)] my-6" />

          <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
            {isKh ? product.description_kh || product.description : product.description}
          </p>

          <div className="space-y-6">
            {colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  {t("product.color")}:{" "}
                  <span className="text-[var(--color-text-secondary)] font-normal">
                    {selectedColor || t("product.select_color")}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => {
                    const hex = getColorHex(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-[var(--color-bg-primary)] scale-110"
                            : "hover:scale-110 ring-1 ring-[var(--color-border)]"
                        }`}
                        style={{ backgroundColor: hex }}
                        title={color}
                      >
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-white drop-shadow-md"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  {t("product.size")}:{" "}
                  <span className="text-[var(--color-text-secondary)] font-normal">
                    {selectedSize || t("product.select_size")}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-10 px-3 rounded-lg border font-medium transition-all ${
                        selectedSize === size
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.attributes &&
              Object.entries(product.attributes).filter(
                ([key]) => !["color", "size"].includes(key.toLowerCase()),
              ).length > 0 && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
                    {t("product.specifications")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.attributes)
                      .filter(
                        ([key]) =>
                          !["color", "size"].includes(key.toLowerCase()),
                      )
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0"
                        >
                          <span className="text-sm font-medium text-[var(--color-text-muted)] capitalize">
                            {key}
                          </span>
                          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>

          <div className="hidden lg:block pt-6 space-y-4">
            {!isOutOfStock ? (
              <>
                <div className="flex items-stretch gap-3">
                  <div className="flex items-center gap-0 bg-[var(--color-bg-secondary)] rounded-full border border-[var(--color-border)] p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all active:scale-90"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 sm:w-10 text-center font-bold text-sm text-[var(--color-text-primary)] select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all active:scale-90"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3 sm:py-3.5 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm sm:text-base hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 active:scale-[0.97] group"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {t("product.add_to_cart")}
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="relative w-full py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[#6366f1] to-[var(--color-primary)] bg-[length:200%_100%] text-white font-bold text-sm sm:text-base tracking-wide shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40 transition-all duration-300 active:scale-[0.98] overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t("product.buy_now")}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 p-4 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-full text-center font-semibold text-sm border border-[var(--color-error)]/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                {t("product.out_of_stock")}
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedFromBundle && (
        <RelatedProducts
          related={relatedFromBundle}
        />
      )}

      {/* Mobile Sticky Bar */}
      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--color-bg-primary)]/95 backdrop-blur-lg border-t border-[var(--color-border)] px-4 py-3 safe-bottom">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col mr-auto">
              <span className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                ${Number(product.price).toFixed(2)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] active:scale-90 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] w-5 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-6 h-6 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] active:scale-90 transition-transform"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-12 h-12 flex-shrink-0 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center active:scale-90 transition-all hover:bg-[var(--color-primary)] hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>

            <button
              onClick={handleBuyNow}
              className="relative flex-1 max-w-[180px] py-3 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[#6366f1] to-[var(--color-primary)] bg-[length:200%_100%] text-white font-bold text-sm tracking-wide shadow-lg shadow-[var(--color-primary)]/30 active:scale-[0.97] transition-all overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t("product.buy_now")}
              </span>
            </button>
          </div>
        </div>
      )}
      <div className="h-20 lg:hidden" />

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
              <span className="text-white/70 text-sm font-medium">
                {lightboxIndex + 1} / {product.images.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              className="flex-1 w-full flex items-center justify-center overflow-hidden px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={getImageUrl(product.images[lightboxIndex])}
                  alt={`${product.title} ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  className="max-w-full max-h-[80vh] object-contain select-none touch-pan-y"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                    e.currentTarget.onerror = null;
                  }}
                />
              </AnimatePresence>
            </div>

            {product.images.length > 1 && (
              <>
                {lightboxIndex > 0 && (
                  <button
                    className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 items-center justify-center text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((i) => Math.max(i - 1, 0));
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {lightboxIndex < product.images.length - 1 && (
                  <button
                    className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 items-center justify-center text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((i) => Math.min(i + 1, product.images.length - 1));
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      className={`rounded-full transition-all duration-300 ${
                        lightboxIndex === index
                          ? "w-6 h-2 bg-white"
                          : "w-2 h-2 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RelatedProducts = ({ related }: { related: Product[] }) => {
  const { t } = useTranslation();
  if (!related || related.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-24 pt-16 border-t border-[var(--color-border)]"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="w-2 h-8 bg-[var(--color-primary)] rounded-full" />
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
          {t("product.related_products")}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {related.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            title={product.title}
            title_kh={product.title_kh}
            price={product.price}
            image={product.images?.[0] || ""}
            category={product.category?.name}
            category_kh={product.category?.name_kh}
            stock={product.stock}
            description_kh={product.description_kh}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
