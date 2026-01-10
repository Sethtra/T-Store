import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useFeaturedProducts,
  useProducts,
  type Product,
} from "../hooks/useProducts";
import { useSectionBanners } from "../hooks/useBanners";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import Button from "../components/ui/Button";
import HeroSection from "../components/home/HeroSection";
import CategoryProductRow from "../components/home/CategoryProductRow";

const HomePage = () => {
  const {
    data: products,
    isLoading: featuredLoading,
    error,
  } = useFeaturedProducts();
  const { data: sectionBanners } = useSectionBanners();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Rotate banners every 5 seconds
  useEffect(() => {
    if (!sectionBanners || sectionBanners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % sectionBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sectionBanners]);

  // Get current active section banner
  const activeBanner = sectionBanners?.[activeBannerIndex];

  // Extract category slug from button_link
  const categorySlug =
    activeBanner?.button_link?.match(/category=([^&]+)/)?.[1] || "electronics";

  // Format category title
  const categoryTitle = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Fetch products for the current banner's category
  const { data: categoryProducts, isLoading: categoryLoading } = useProducts({
    category: categorySlug,
    limit: 10,
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section
        id="featured-products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              Handpicked products just for you
            </p>
          </div>
          <Link to="/products">
            <Button variant="ghost">View All →</Button>
          </Link>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-[var(--color-error)]">Failed to load products</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products
                ?.slice(0, 8)
                .map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    image={product.images?.[0] || "/placeholder.png"}
                    category={product.category?.name}
                    stock={product.stock}
                    description={product.description}
                  />
                ))}
        </div>
      </section>

      {/* Rotating Section Banner Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[400px]">
        {activeBanner && categoryProducts?.data ? (
          <CategoryProductRow
            title={categoryTitle}
            bannerTitle={activeBanner.title}
            bannerTextColor={activeBanner.text_color}
            products={categoryProducts.data}
            categorySlug={categorySlug}
            showHero
            bannerImage={activeBanner.image}
          />
        ) : (
          <div className="h-[400px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading Collection...</div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-[var(--color-bg-elevated)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                description: "On orders over $50",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                description: "100% protected transactions",
              },
              {
                icon: "💬",
                title: "24/7 Support",
                description: "We're here to help",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-center bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-2xl">
          {/* Decorative Gradient Blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
              Join Our Newsletter
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto">
              Subscribe to get special offers, free giveaways, and exclusive
              deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
              <Button
                size="lg"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/25"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
