import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogCategory } from "../../hooks/useCatalogIndex";
import { getDiscount } from "../../utils/money";
import ProductCard from "../product/ProductCard";
import ProductCardSkeleton from "../product/ProductCardSkeleton";
import SectionHeader from "./SectionHeader";

interface DealRowProps {
  id: string;
  group?: CatalogCategory;
  isLoading?: boolean;
}

/** "Grab the best deal on {Category}": one scrollable row of deal cards, discounted items first. */
const DealRow = ({ id, group, isLoading }: DealRowProps) => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const railRef = useRef<HTMLUListElement>(null);

  if (!isLoading && !group) return null;

  const name = group ? (isKh && group.category.name_kh ? group.category.name_kh : group.category.name) : "";
  const products = group
    ? [...group.products]
        .sort((a, b) => (getDiscount(b.price, b.original_price)?.percent ?? 0) - (getDiscount(a.price, a.original_price)?.percent ?? 0))
        .slice(0, 10)
    : [];

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("li");
    rail.scrollBy({ left: dir * ((card?.getBoundingClientRect().width ?? 200) + 16) * 2, behavior: "smooth" });
  };

  const arrows =
    products.length > 5 ? (
      <span className="hidden gap-1 lg:flex">
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border-hover)] hover:border-[var(--color-text-primary)]">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => scrollBy(1)} aria-label="Next" className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border-hover)] hover:border-[var(--color-text-primary)]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </span>
    ) : null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 mt-14 md:mt-20" aria-labelledby={id}>
      <SectionHeader
        id={id}
        lead={t("home.best_deal_lead")}
        highlight={name || " "}
        viewAllTo={group ? `/products?category=${group.category.slug}` : "/products"}
        actions={arrows}
      />

      <ul
        ref={railRef}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 pt-1 md:mx-0 md:gap-4 md:scroll-px-0 md:px-0"
      >
        {(isLoading ? Array.from({ length: 5 }, () => null) : products).map((product, i) => (
          <li
            key={product?.id ?? i}
            className="w-[44%] shrink-0 snap-start sm:w-[31%] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)]"
          >
            {product ? (
              <ProductCard
                id={product.id}
                slug={product.slug}
                title={product.title}
                title_kh={product.title_kh}
                price={product.price}
                original_price={product.original_price}
                image={product.images?.[0] || "/placeholder.jpg"}
                category={product.category?.name}
                category_kh={product.category?.name_kh}
                stock={product.stock}
                attributes={product.attributes}
              />
            ) : (
              <ProductCardSkeleton />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DealRow;
