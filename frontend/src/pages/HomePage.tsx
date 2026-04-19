import { Link } from "react-router-dom";
import { useLandingData, type Product } from "../hooks/useLandingData";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import Button from "../components/ui/Button";
import HeroSection from "../components/home/HeroSection";
import BrowseByCategories from "../components/home/BrowseByCategories";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();
  const { data: landingData, isLoading, error } = useLandingData();
  const products = landingData?.featured_products;

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
            <h2 className="text-3xl font-bold">
              {t("home.featured_title")}
            </h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              {t("home.featured_sub")}
            </p>
          </div>
          <Link to="/products">
            <Button variant="ghost">{t("home.view_all")}</Button>
          </Link>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-[var(--color-error)]">
              {t("home.failed_load")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading
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
                    title_kh={product.title_kh}
                    price={product.price}
                    image={product.images?.[0] || "/placeholder.png"}
                    category={product.category?.name}
                    category_kh={product.category?.name_kh}
                    stock={product.stock}
                    description={product.description}
                    description_kh={product.description_kh}
                  />
                ))}
        </div>
      </section>

      {/* Browse by Categories */}
      <BrowseByCategories />

      {/* Features Section */}
      <section className="bg-[var(--color-bg-elevated)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: t("home.shipping_title"),
                description: t("home.shipping_desc"),
              },
              {
                icon: "🔒",
                title: t("home.secure_title"),
                description: t("home.secure_desc"),
              },
              {
                icon: "💬",
                title: t("home.support_title"),
                description: t("home.support_desc"),
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
              {t("home.newsletter_title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto">
              {t("home.newsletter_sub")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder={t("home.enter_email")}
                className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
              />
              <Button
                size="lg"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-lg shadow-[var(--color-primary)]/25"
              >
                {t("home.subscribe")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
