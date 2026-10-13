import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CreditCard, Expand, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { formatUSD, getDiscount } from "../utils/money";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useProduct, type Product } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { getImageUrl } from "../utils/image";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ui/toastContext";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
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
      showToast(isKh ? "សូមជ្រើសរើសព័ណ៌" : "Please select a color", "warning");
      return false;
    }
    if (sizes.length > 0 && !selectedSize) {
      showToast(isKh ? "សូមជ្រើសរើសទំហំ" : "Please select a size", "warning");
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
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10" aria-busy="true">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 aspect-square rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)]" />
          <div className="lg:col-span-5 space-y-4 pt-2">
            <div className="h-4 w-24 rounded bg-[var(--color-bg-surface)]" />
            <div className="h-10 w-3/4 rounded bg-[var(--color-bg-surface)]" />
            <div className="h-7 w-28 rounded bg-[var(--color-bg-surface)]" />
            <div className="h-24 rounded bg-[var(--color-bg-surface)]" />
            <div className="h-12 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold">{t("product.not_found")}</h1>
        <Button className="mt-6" onClick={() => navigate("/products")}>
          {t("product.browse_products")}
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const discount = getDiscount(product.price, product.original_price);
  const colors = getAttributeValues("Color");
  const sizes = getAttributeValues("Size");
  const title = isKh ? product.title_kh || product.title : product.title;
  const description = isKh ? product.description_kh || product.description : product.description;
  const categoryName = product.category
    ? isKh && product.category.name_kh
      ? product.category.name_kh
      : product.category.name
    : null;
  const specs = product.attributes
    ? Object.entries(product.attributes).filter(([key]) => !["color", "size"].includes(key.toLowerCase()))
    : [];

  const stepper = (compact = false) => (
    <div
      className={`inline-flex items-center rounded-[var(--radius-md)] border border-[var(--color-border-hover)] ${
        compact ? "h-11" : "h-12"
      }`}
      role="group"
      aria-label={t("product.quantity")}
    >
      <button
        type="button"
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        aria-label={t("product.decrease")}
        className={`grid place-items-center h-full ${compact ? "w-9" : "w-11"} text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-35`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="tabular w-8 text-center font-semibold" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
        disabled={quantity >= product.stock}
        aria-label={t("product.increase")}
        className={`grid place-items-center h-full ${compact ? "w-9" : "w-11"} text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-35`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-8">
      <nav aria-label="Breadcrumb" className="mb-5 md:mb-8">
        <ol className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] min-w-0">
          <li>
            <Link to="/" className="hover:text-[var(--color-text-primary)]">
              {t("nav.home")}
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <li>
            <Link to="/products" className="hover:text-[var(--color-text-primary)]">
              {t("products.title")}
            </Link>
          </li>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 hidden sm:block" aria-hidden="true" />
              <li className="hidden sm:block">
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="hover:text-[var(--color-text-primary)]"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <button
            type="button"
            onClick={() => openLightbox(selectedImage)}
            className="relative block w-full aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] cursor-zoom-in"
            aria-label={t("product.view_image", { n: selectedImage + 1 })}
          >
            <img
              key={selectedImage}
              src={getImageUrl(product.images[selectedImage])}
              alt={title}
              className={`h-full w-full object-contain p-[8%] rise-in ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
                e.currentTarget.onerror = null;
              }}
            />
            <span className="absolute bottom-3 right-3 grid place-items-center w-10 h-10 rounded-full bg-[var(--color-bg-primary)] shadow-[var(--shadow-sm)]">
              <Expand className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>

          {product.images.length > 1 && (
            <div className="mt-1 flex gap-2 overflow-x-auto scrollbar-hide p-1.5 -mx-1.5">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={t("product.view_image", { n: index + 1 })}
                  aria-current={selectedImage === index ? "true" : undefined}
                  className={`relative shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] ring-offset-2 ring-offset-[var(--color-bg-primary)] transition-shadow ${
                    selectedImage === index ? "ring-2 ring-[var(--color-text-primary)]" : "hover:ring-1 hover:ring-[var(--color-border-hover)]"
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain p-1.5"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            {categoryName && <p className="text-sm text-[var(--color-text-muted)]">{categoryName}</p>}
            <h1 className="mt-1 text-[1.875rem] font-semibold leading-tight tracking-[-0.03em] md:text-[2.375rem]">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="tabular text-2xl font-semibold tracking-[-0.01em]">{formatUSD(product.price)}</p>
              {discount && (
                <>
                  <p className="tabular text-lg text-[var(--color-text-muted)] line-through">{formatUSD(discount.original)}</p>
                  <p className="tabular rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-0.5 text-sm font-bold text-[var(--color-on-primary)]">
                    {discount.percent}% {isKh ? "បញ្ចុះ" : "OFF"}
                  </p>
                  <p className="tabular basis-full text-sm font-medium text-[var(--color-success)]">
                    {isKh ? "សន្សំ" : "Save"} - {formatUSD(discount.save)}
                  </p>
                </>
              )}
            </div>

            <p
              className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                isOutOfStock
                  ? "text-[var(--color-error)]"
                  : isLowStock
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-success)]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
              {isOutOfStock
                ? t("product.out_of_stock")
                : isLowStock
                  ? t("product.only_left", { count: product.stock })
                  : t("product.in_stock")}
            </p>

            {description && (
              <p className="mt-6 max-w-prose text-[0.9875rem] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-line">
                {description}
              </p>
            )}

            {colors.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-sm font-semibold">
                  {t("product.color")}
                  <span className="ml-2 font-normal text-[var(--color-text-secondary)]">
                    {selectedColor || t("product.select_color")}
                  </span>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={isSelected}
                        aria-label={color}
                        title={color}
                        className={`w-9 h-9 rounded-full border border-black/10 ring-offset-2 ring-offset-[var(--color-bg-primary)] transition-shadow ${
                          isSelected ? "ring-2 ring-[var(--color-text-primary)]" : "hover:ring-1 hover:ring-[var(--color-border-hover)]"
                        }`}
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                    );
                  })}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-7">
                <legend className="mb-3 text-sm font-semibold">
                  {t("product.size")}
                  <span className="ml-2 font-normal text-[var(--color-text-secondary)]">
                    {selectedSize || t("product.select_size")}
                  </span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-12 h-11 px-3 rounded-[var(--radius-md)] border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-[var(--color-text-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                          : "border-[var(--color-border-hover)] hover:border-[var(--color-text-primary)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Actions (desktop) */}
            <div className="mt-8 hidden lg:block">
              {!isOutOfStock ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {stepper()}
                    <Button size="lg" className="flex-1 h-12" onClick={handleAddToCart}>
                      <ShoppingBag className="w-[18px] h-[18px]" />
                      {t("product.add_to_cart")}
                    </Button>
                  </div>
                  <Button size="lg" variant="outline" fullWidth className="h-12" onClick={handleBuyNow}>
                    {t("product.buy_now")}
                  </Button>
                </div>
              ) : (
                <Button size="lg" fullWidth disabled className="h-12">
                  {t("product.out_of_stock")}
                </Button>
              )}
            </div>

            {/* Quantity (mobile) */}
            {!isOutOfStock && (
              <div className="mt-7 flex items-center justify-between lg:hidden">
                <span className="text-sm font-semibold">{t("product.quantity")}</span>
                {stepper(true)}
              </div>
            )}

            <ul className="mt-8 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] text-sm">
              <li className="flex items-center gap-3 py-3.5">
                <CreditCard className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" aria-hidden="true" />
                {t("home.facts_khqr")}
              </li>
              <li className="flex items-center gap-3 py-3.5">
                <Truck className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" aria-hidden="true" />
                {t("home.facts_delivery")}
              </li>
            </ul>

            {specs.length > 0 && (
              <section className="mt-8">
                <h2 className="text-base font-semibold">{t("product.specifications")}</h2>
                <dl className="mt-3 divide-y divide-[var(--color-border)] text-sm">
                  {specs.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3">
                      <dt className="capitalize text-[var(--color-text-muted)]">{key}</dt>
                      <dd className="font-medium">{Array.isArray(value) ? value.join(", ") : value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>

      {relatedFromBundle && <RelatedProducts related={relatedFromBundle} />}

      {/* Mobile purchase bar */}
      <div className="lg:hidden h-[calc(76px+env(safe-area-inset-bottom))]" aria-hidden="true" />
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {!isOutOfStock ? (
          <div className="flex items-center gap-2">
            <div className="mr-auto min-w-0">
              <p className="tabular text-lg font-semibold leading-tight">{formatUSD(product.price * quantity)}</p>
              {quantity > 1 && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {quantity} × {formatUSD(product.price)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={t("product.add_to_cart")}
              className="grid place-items-center h-12 w-12 shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-hover)]"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="h-12 px-6 rounded-[var(--radius-md)] bg-[var(--color-primary)] font-semibold text-[var(--color-on-primary)]"
            >
              {t("product.buy_now")}
            </button>
          </div>
        ) : (
          <Button fullWidth disabled className="h-12">
            {t("product.out_of_stock")}
          </Button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[9999] flex flex-col bg-[var(--color-bg-primary)]"
            onClick={closeLightbox}
          >
            <div className="flex items-center justify-between px-4 h-14 pt-[env(safe-area-inset-top)] shrink-0">
              <span className="tabular text-sm text-[var(--color-text-secondary)]">
                {lightboxIndex + 1} / {product.images.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close"
                className="grid place-items-center w-10 h-10 rounded-full hover:bg-[var(--color-bg-surface)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden px-4" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={getImageUrl(product.images[lightboxIndex])}
                  alt={`${title} ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  className="max-w-full max-h-[78vh] object-contain select-none touch-pan-y"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                    e.currentTarget.onerror = null;
                  }}
                />
              </AnimatePresence>
            </div>

            {product.images.length > 1 && (
              <div className="flex items-center justify-center gap-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={lightboxIndex === 0}
                  onClick={() => setLightboxIndex((i) => Math.max(i - 1, 0))}
                  aria-label="Previous image"
                  className="grid place-items-center w-11 h-11 rounded-full border border-[var(--color-border-hover)] disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1.5">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      aria-label={t("product.view_image", { n: index + 1 })}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        lightboxIndex === index ? "w-6 bg-[var(--color-text-primary)]" : "w-1.5 bg-[var(--color-border-hover)]"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={lightboxIndex === product.images.length - 1}
                  onClick={() => setLightboxIndex((i) => Math.min(i + 1, product.images.length - 1))}
                  aria-label="Next image"
                  className="grid place-items-center w-11 h-11 rounded-full border border-[var(--color-border-hover)] disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
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
    <section className="mt-20 md:mt-28" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-6 text-2xl font-semibold tracking-[-0.025em] md:mb-8 sm:text-3xl">
        {t("product.related_products")}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-5">
        {related.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            title={product.title}
            title_kh={product.title_kh}
            price={product.price}
            original_price={product.original_price}
            image={product.images?.[0] || ""}
            category={product.category?.name}
            category_kh={product.category?.name_kh}
            stock={product.stock}
            attributes={product.attributes}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductDetailPage;
