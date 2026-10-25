import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CreditCard, Expand, Languages, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { formatUSD, getDiscount } from "../utils/money";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useProduct, type Product } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import ColorShowcase from "../components/product/ColorShowcase";
import PhoneSpecsTable from "../components/product/PhoneSpecsTable";
import { hasSpecs, keySpecs } from "../utils/phoneSpecs";
import { defaultVariant, findVariant, optionAxes } from "../utils/variants";
import type { ProductVariant } from "../types/product";
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
  const [tab, setTab] = useState<"specs" | "delivery">("specs");

  // Colours with photo sets win over the old free-text Color attribute; the first one is preselected
  const productColors = product?.colors ?? [];
  const activeColor = selectedColor || productColors[0]?.name || "";

  // Memory options (RAM / storage): each has its own price and stock; the cheapest in stock is preselected
  const variants = product?.active_variants ?? [];
  const [pickedVariantId, setPickedVariantId] = useState<number | null>(null);
  const activeVariant = variants.find((v) => v.id === pickedVariantId) ?? defaultVariant(variants);
  const unitPrice = activeVariant ? Number(activeVariant.price) : Number(product?.price ?? 0);
  const unitStock = activeVariant ? activeVariant.stock : (product?.stock ?? 0);
  const pickVariant = (v: ProductVariant | undefined) => {
    if (!v) return;
    setPickedVariantId(v.id);
    setQuantity((q) => Math.max(1, Math.min(q, v.stock)));
  };

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (): boolean => {
    if (!product) return false;

    // Optional: Validate selection if attributes exist
    const colors = productColors.length ? productColors.map((c) => c.name) : getAttributeValues("Color");
    const sizes = getAttributeValues("Size");

    if (colors.length > 0 && !activeColor) {
      showToast(isKh ? "សូមជ្រើសរើសព័ណ៌" : "Please select a color", "warning");
      return false;
    }
    if (variants.length > 0 && !activeVariant) {
      showToast(isKh ? "សូមជ្រើសរើស RAM និងទំហំផ្ទុក" : "Please choose RAM and storage", "warning");
      return false;
    }
    if (sizes.length > 0 && !selectedSize) {
      showToast(isKh ? "សូមជ្រើសរើសទំហំ" : "Please select a size", "warning");
      return false;
    }

    for (let i = 0; i < quantity; i++) {
      const attributes: Record<string, string> = {
        ...(activeColor ? { Color: activeColor } : {}),
        ...(selectedSize ? { Size: selectedSize } : {}),
        ...(activeVariant ? { Memory: activeVariant.label } : {}),
      };

      addItem({
        id: product.id,
        slug: product?.slug,
        title: product.title,
        price: unitPrice,
        image: product.images[0] || "/placeholder.jpg",
        attributes,
        variant_id: activeVariant?.id ?? null,
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="aspect-[4/5] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)]" />
          <div className="space-y-4 pt-2">
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

  const isOutOfStock = unitStock <= 0;
  const isLowStock = !isOutOfStock && unitStock <= 5;
  const discount = getDiscount(unitPrice, activeVariant ? activeVariant.original_price : product.original_price);
  const { rams, storages } = optionAxes(variants);
  const activeRam = activeVariant?.ram ?? null;
  const activeStorage = activeVariant?.storage ?? null;
  // Changing RAM keeps the storage if that combination exists, else takes the best one with that RAM
  const pickRam = (ram: string) =>
    pickVariant(findVariant(variants, ram, activeStorage) ?? defaultVariant(variants.filter((v) => v.ram === ram)));
  const colors = productColors.length ? productColors.map((c) => c.name) : getAttributeValues("Color");
  const swatchFor = (name: string) => productColors.find((c) => c.name === name)?.hex || getColorHex(name);
  const sizes = getAttributeValues("Size");
  const title = isKh ? product.title_kh || product.title : product.title;
  const description = isKh ? product.description_kh || product.description : product.description;
  const categoryName = product.category
    ? isKh && product.category.name_kh
      ? product.category.name_kh
      : product.category.name
    : null;
  const legacySpecs = product.attributes
    ? Object.entries(product.attributes).filter(([key]) => !["color", "size"].includes(key.toLowerCase()))
    : [];
  const hasPhoneSpecs = hasSpecs(product.specs);
  const highlights = keySpecs(product.specs, isKh);
  const hasThumbs = product.images.length > 1;
  const colorLabel = (name: string) => {
    const c = productColors.find((x) => x.name === name);
    return isKh && c?.name_kh ? c.name_kh : name;
  };
  const tabs = [
    ...(hasPhoneSpecs || legacySpecs.length ? [{ key: "specs" as const, label: t("product.specifications") }] : []),
    { key: "delivery" as const, label: isKh ? "ការដឹកជញ្ជូន និងការបង់ប្រាក់" : "Delivery & payment" },
  ];
  const activeTab = tabs.some((x) => x.key === tab) ? tab : tabs[0].key;

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
        onClick={() => setQuantity(Math.min(unitStock, quantity + 1))}
        disabled={quantity >= unitStock}
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

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Gallery: thumbnail column + tall main photo */}
        <div className={hasThumbs ? "grid grid-cols-[56px_minmax(0,1fr)] gap-2.5 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-3" : ""}>
          {hasThumbs && (
            <div className="relative">
              <div className="scrollbar-hide absolute inset-0 flex flex-col gap-2.5 overflow-y-auto p-0.5">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={t("product.view_image", { n: index + 1 })}
                    aria-current={selectedImage === index ? "true" : undefined}
                    className={`aspect-square w-full shrink-0 overflow-hidden rounded-[10px] border bg-[var(--color-bg-surface)] transition-colors ${
                      selectedImage === index ? "border-[var(--color-text-primary)]" : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
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
            </div>
          )}

          <button
            type="button"
            onClick={() => openLightbox(selectedImage)}
            className="relative block w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
            aria-label={t("product.view_image", { n: selectedImage + 1 })}
          >
            <div className="aspect-[4/5]">
              <img
                key={selectedImage}
                src={getImageUrl(product.images[selectedImage])}
                alt={title}
                className={`rise-in h-full w-full object-contain p-[8%] ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            {discount && !isOutOfStock && (
              <span className="tabular absolute left-3.5 top-3.5 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-xs font-bold text-[var(--color-on-primary)]">
                {discount.percent}% {isKh ? "បញ្ចុះ" : "OFF"}
              </span>
            )}
            <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[var(--color-bg-primary)] shadow-[var(--shadow-sm)]">
              <Expand className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>

        {/* Buy box */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="flex flex-col gap-2.5">
            {categoryName && (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">{categoryName}</p>
            )}
            <h1 className="line-clamp-2 text-[clamp(1.75rem,2.8vw,2.375rem)] font-semibold leading-[1.12] tracking-[-0.03em]">{title}</h1>
            {description && (
              <p className="line-clamp-4 max-w-[52ch] whitespace-pre-line text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="tabular text-[2.5rem] font-semibold leading-none tracking-[-0.02em] sm:text-[2.75rem]">{formatUSD(unitPrice)}</p>
            {discount && <p className="tabular text-lg text-[var(--color-text-muted)] line-through">{formatUSD(discount.original)}</p>}
            {activeVariant && <p className="text-sm text-[var(--color-text-secondary)]">{activeVariant.label}</p>}
            <p
              className={`ml-auto flex items-center gap-1.5 whitespace-nowrap text-[0.8125rem] font-semibold ${
                isOutOfStock ? "text-[var(--color-error)]" : isLowStock ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {isOutOfStock
                ? t("product.out_of_stock")
                : isLowStock
                  ? t("product.only_left", { count: unitStock })
                  : t("product.in_stock")}
            </p>
            {discount && (
              <p className="tabular basis-full text-sm font-medium text-[var(--color-success)]">
                {isKh ? "សន្សំ" : "Save"} {formatUSD(discount.save)}
              </p>
            )}
          </div>

          {colors.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em]">
                {t("product.color")} ·{" "}
                <span className="font-normal normal-case tracking-normal text-[var(--color-text-secondary)]">
                  {activeColor ? colorLabel(activeColor) : t("product.select_color")}
                </span>
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => {
                  const isSelected = activeColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={isSelected}
                      aria-label={colorLabel(color)}
                      title={colorLabel(color)}
                      className={`h-[34px] w-[34px] rounded-full border-[1.5px] p-[3px] transition-colors ${
                        isSelected ? "border-[var(--color-text-primary)]" : "border-transparent hover:border-[var(--color-border-hover)]"
                      }`}
                    >
                      <span
                        className="block h-full w-full rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
                        style={{ backgroundColor: swatchFor(color) }}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {variants.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
              {rams.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em]">RAM</legend>
                  <div className="flex flex-wrap gap-2">
                    {rams.map((ram) => {
                      const isActive = activeRam === ram;
                      const anyInStock = variants.some((v) => v.ram === ram && v.stock > 0);
                      return (
                        <button
                          key={ram}
                          type="button"
                          onClick={() => pickRam(ram)}
                          aria-pressed={isActive}
                          className={`h-10 min-w-[4.5rem] flex-1 whitespace-nowrap rounded-[10px] border px-3 text-sm font-semibold transition-colors ${
                            isActive
                              ? "border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
                              : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                          } ${anyInStock ? "" : "text-[var(--color-text-muted)]"}`}
                        >
                          {ram}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {storages.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em]">{isKh ? "ទំហំផ្ទុក" : "Storage"}</legend>
                  <div className="flex flex-wrap gap-2">
                    {storages.map((storage) => {
                      const match = findVariant(variants, rams.length ? activeRam : null, storage);
                      const isActive = activeStorage === storage;
                      const soldOut = match ? match.stock <= 0 : false;
                      return (
                        <button
                          key={storage}
                          type="button"
                          onClick={() => pickVariant(match)}
                          disabled={!match}
                          aria-pressed={isActive}
                          title={!match ? (isKh ? "មិនមានជម្រើសនេះទេ" : "Not available with this RAM") : soldOut ? (isKh ? "អស់ពីស្តុក" : "Sold out") : undefined}
                          className={`h-10 min-w-[4.5rem] flex-1 whitespace-nowrap rounded-[10px] border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            isActive
                              ? "border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
                              : "border-[var(--color-border)] enabled:hover:border-[var(--color-border-hover)]"
                          } ${soldOut ? "text-[var(--color-text-muted)] line-through" : ""}`}
                        >
                          {storage}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {sizes.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em]">
                {t("product.size")} ·{" "}
                <span className="font-normal normal-case tracking-normal text-[var(--color-text-secondary)]">
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
                    className={`h-10 min-w-12 rounded-[10px] border px-3.5 text-sm font-semibold transition-colors ${
                      selectedSize === size
                        ? "border-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Actions (desktop) */}
          <div className="hidden lg:block">
            {!isOutOfStock ? (
              <div className="flex flex-wrap gap-3">
                {stepper()}
                <Button size="lg" className="h-12 flex-[1_1_10rem]" onClick={handleAddToCart}>
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {t("product.add_to_cart")}
                </Button>
                <Button size="lg" variant="outline" className="h-12 flex-[1_1_7.5rem]" onClick={handleBuyNow}>
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
            <div className="flex items-center justify-between lg:hidden">
              <span className="text-xs font-semibold uppercase tracking-[0.08em]">{t("product.quantity")}</span>
              {stepper(true)}
            </div>
          )}

          {highlights.length > 0 && (
            <dl
              className={`grid gap-px overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-border)] sm:[grid-template-columns:repeat(var(--n),minmax(0,1fr))] ${
                highlights.length > 2 ? "grid-cols-2" : "[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
              }`}
              style={{ "--n": highlights.length } as React.CSSProperties}
            >
              {highlights.map((k) => (
                <div key={k.label} className="flex min-w-0 flex-col-reverse gap-0.5 bg-[var(--color-bg-primary)] p-3">
                  <dt className="truncate text-[11px] text-[var(--color-text-muted)]">{k.label}</dt>
                  <dd className="tabular truncate text-lg font-semibold leading-tight tracking-[-0.01em] sm:text-[1.375rem]">{k.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <ul className="flex flex-col gap-2 text-[0.8125rem] text-[var(--color-text-secondary)]">
            <li className="flex items-center gap-2.5">
              <CreditCard className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {t("home.facts_khqr")}
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {t("home.facts_delivery")}
            </li>
          </ul>
        </div>
      </div>

      {productColors.length > 0 && (
        <ColorShowcase colors={productColors} selected={activeColor} onSelect={setSelectedColor} isKh={isKh} title={title} />
      )}

      {/* Details tabs */}
      <section className="mt-16 md:mt-20" aria-label={isKh ? "ព័ត៌មានលម្អិត" : "Product details"}>
        <div role="tablist" className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto border-b border-[var(--color-border)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              onClick={() => setTab(tab.key)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-semibold uppercase tracking-[0.06em] transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "specs" &&
            (hasPhoneSpecs ? (
              <PhoneSpecsTable specs={product.specs!} isKh={isKh} />
            ) : (
              <dl className="grid md:grid-cols-2 md:gap-x-12">
                {legacySpecs.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-4 border-b border-[var(--color-border)] py-3.5">
                    <dt className="text-sm capitalize text-[var(--color-text-muted)]">{key}</dt>
                    <dd className="text-[0.9375rem]">{Array.isArray(value) ? value.join(", ") : value}</dd>
                  </div>
                ))}
              </dl>
            ))}
          {activeTab === "delivery" && (
            <ul className="flex max-w-[64ch] flex-col gap-3 text-[0.9375rem]">
              <li className="flex items-center gap-3">
                <Truck className="h-[18px] w-[18px] shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
                {t("home.facts_delivery")}
              </li>
              <li className="flex items-center gap-3">
                <CreditCard className="h-[18px] w-[18px] shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
                {t("home.facts_khqr")}
              </li>
              <li className="flex items-center gap-3">
                <Languages className="h-[18px] w-[18px] shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
                {t("home.facts_language")}
              </li>
            </ul>
          )}
        </div>
      </section>

      {relatedFromBundle && <RelatedProducts related={relatedFromBundle} />}

      {/* Mobile purchase bar */}
      <div className="lg:hidden h-[calc(76px+env(safe-area-inset-bottom))]" aria-hidden="true" />
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {!isOutOfStock ? (
          <div className="flex items-center gap-2">
            <div className="mr-auto min-w-0">
              <p className="tabular text-lg font-semibold leading-tight">{formatUSD(unitPrice * quantity)}</p>
              {quantity > 1 && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {quantity} × {formatUSD(unitPrice)}
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
            specs={product.specs}
            colors={product.colors}
            variants={product.active_variants}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductDetailPage;
