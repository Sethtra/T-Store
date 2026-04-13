import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProduct, useProducts } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { getImageUrl } from "../utils/image";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Attribute selections
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (): boolean => {
    if (!product) return false;

    // Optional: Validate selection if attributes exist
    // For now we allow adding without selection if user doesn't pick,
    // unless we want to enforce it. Let's enforce if keys exist.
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
      // Construct attributes object
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

    // Find key case-insensitively if needed, or exact match
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
      beige: "#d4d4d8", // approximate
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
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
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
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => navigate("/products")}
          className="hover:text-[var(--color-text-primary)]"
        >
          Products
        </button>
        <span>/</span>
        <span className="text-[var(--color-text-primary)] font-medium">
          {product.title}
        </span>
      </nav>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Image Gallery - Span 8 (Left) */}
        <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 h-auto">
          {/* Thumbnails (Left) - Vertical Stack */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 lg:grid-cols-1 lg:grid-rows-4 gap-4 shrink-0 w-full lg:w-36 h-auto lg:h-full order-2 lg:order-1">
              {product.images.slice(0, 4).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-full h-24 lg:h-full rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[var(--color-bg-secondary)] ${
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

          <div className="flex-1 relative rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] group h-full min-h-[600px] order-1 lg:order-2">
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
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info - Span 4 (Right) */}
        <div className="lg:col-span-4 flex flex-col pt-4">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-3">
              {product.category && (
                <span className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
              <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                 {/* Placeholder for future ratings */}
                 <span className="ml-1 text-xs px-2 py-1 bg-[var(--color-bg-elevated)] rounded">No Reviews Yet</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-[var(--color-text-primary)] mb-4">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[var(--color-text-primary)]">
                ${Number(product.price).toFixed(2)}
              </span>
              {/* Optional fake original price for effect */}
              {/* <span className="text-lg text-[var(--color-text-muted)] line-through">${(Number(product.price) * 1.2).toFixed(2)}</span> */}
            </div>
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          {/* Description */}
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {product.description}
          </p>

          {/* Attributes Configurator */}
          <div className="space-y-6">
            {/* Color Selector */}
            {colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  Color:{" "}
                  <span className="text-[var(--color-text-secondary)] font-normal">
                    {selectedColor || "Select a color"}
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
                        {/* Checkmark for selected (inverted color roughly) */}
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

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  Size:{" "}
                  <span className="text-[var(--color-text-secondary)] font-normal">
                    {selectedSize || "Select a size"}
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

            {/* Other Specifications */}
            {product.attributes &&
              Object.entries(product.attributes).filter(
                ([key]) => !["color", "size"].includes(key.toLowerCase()),
              ).length > 0 && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
                    Specifications
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

          {/* Actions */}
          <div className="pt-6 space-y-4">
            {!isOutOfStock ? (
              <>
                <div className="flex gap-4">
                  {/* Quantity */}
                  <div className="flex items-center bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:text-[var(--color-primary)] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="w-12 h-12 flex items-center justify-center hover:text-[var(--color-primary)] transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={handleAddToCart}
                    className="flex-1 py-4 text-lg !rounded-xl"
                  >
                    Add to Cart
                  </Button>
                </div>

                {/* Buy Now - Primary Action */}
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  className="w-full py-4 text-lg font-bold !rounded-xl shadow-xl shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 transition-shadow"
                >
                  Buy Now
                </Button>
              </>
            ) : (
              <div className="p-4 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-xl text-center font-medium border border-[var(--color-error)]/20">
                Currently Out of Stock
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[var(--color-border)]">
            <div className="text-center space-y-2 group cursor-pointer hover:bg-[var(--color-bg-secondary)] p-2 rounded-xl transition-colors">
              <div className="w-12 h-12 mx-auto bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                Quality Guarantee
              </p>
            </div>
            <div className="text-center space-y-2 group cursor-pointer hover:bg-[var(--color-bg-secondary)] p-2 rounded-xl transition-colors">
              <div className="w-12 h-12 mx-auto bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                Free Shipping
              </p>
            </div>
            <div className="text-center space-y-2 group cursor-pointer hover:bg-[var(--color-bg-secondary)] p-2 rounded-xl transition-colors">
              <div className="w-12 h-12 mx-auto bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                24/7 Support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.category && (
        <RelatedProducts
          categorySlug={product.category.slug}
          currentProductId={product.id}
        />
      )}
    </div>
  );
};

// Related Products Component
const RelatedProducts = ({
  categorySlug,
  currentProductId,
}: {
  categorySlug: string;
  currentProductId: number;
}) => {
  const { data } = useProducts({ category: categorySlug, limit: 5 });

  const related = (data?.data || []).filter((p) => p.id !== currentProductId).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-16 pt-12 border-t border-[var(--color-border)]"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          You Might Also Like
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {related.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            title={product.title}
            price={product.price}
            image={product.images?.[0] || ""}
            category={product.category?.name}
            stock={product.stock}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
