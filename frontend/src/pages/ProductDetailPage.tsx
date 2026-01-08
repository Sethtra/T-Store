import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProduct } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.images[0] || "/placeholder.jpg",
      });
    }
    openCart();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-32 skeleton rounded" />
            <div className="h-10 w-3/4 skeleton rounded" />
            <div className="h-6 w-24 skeleton rounded" />
            <div className="h-24 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container py-8">
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
        <span className="text-[var(--color-text-primary)]">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <img
              src={product.images[selectedImage] || "/placeholder.jpg"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-[var(--color-primary)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Category */}
          {product.category && (
            <Badge variant="primary">{product.category.name}</Badge>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold">{product.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--color-primary)]">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="error">Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Only {product.stock} left</Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <p className="text-[var(--color-text-secondary)]">
              {product.description}
            </p>
          </div>

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="space-y-3 py-4 border-t border-[var(--color-border)]">
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)] capitalize">
                    {key}
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-[var(--color-border)] rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-3 min-w-[3rem] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button size="lg" onClick={handleAddToCart} className="flex-1">
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              Free Shipping
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              30-Day Returns
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Secure Checkout
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              24/7 Support
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
