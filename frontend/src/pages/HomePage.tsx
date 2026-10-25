import { useTranslation } from "react-i18next";
import { useLandingData, type Product } from "../hooks/useLandingData";
import { useCatalogIndex } from "../hooks/useCatalogIndex";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import HeroSection from "../components/home/HeroSection";
import SectionHeader from "../components/home/SectionHeader";
import TopCategories from "../components/home/TopCategories";
import DealRow from "../components/home/DealRow";

const HomePage = () => {
  const { t } = useTranslation();
  const { data: landingData, isLoading, error } = useLandingData();
  const { groups, isLoading: catalogLoading } = useCatalogIndex();
  const products = landingData?.featured_products;

  return (
    <div className="pb-4">
      <HeroSection />

      {/* Category shortcuts, then deals from the biggest category */}
      <TopCategories />

      <DealRow id="home-deals-1" group={groups[0]} isLoading={catalogLoading} />

      <section
        id="featured-products"
        aria-labelledby="home-featured"
        className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 mt-14 md:mt-20 scroll-mt-24"
      >
        <SectionHeader
          id="home-featured"
          lead={t("home.featured_lead")}
          highlight={t("home.featured_highlight")}
          viewAllTo="/products"
        />

        {error ? (
          <div role="alert" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-6 py-12 text-center">
            <p className="font-medium">{t("home.failed_load")}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold underline underline-offset-4"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : (
          // Same card width as the deal rows (5 across on desktop); in-between widths drop the cards that would leave a half row
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 sm:max-md:[&>:nth-child(n+10)]:hidden md:max-lg:[&>:nth-child(n+9)]:hidden">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products?.slice(0, 10).map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    title_kh={product.title_kh}
                    price={product.price}
                    original_price={product.original_price}
                    image={product.images?.[0] || "/placeholder.png"}
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
        )}
      </section>

      {/* Second deal row replaces the old "In the spotlight" gallery */}
      <DealRow id="home-deals-2" group={groups[1]} isLoading={catalogLoading} />
    </div>
  );
};

export default HomePage;
