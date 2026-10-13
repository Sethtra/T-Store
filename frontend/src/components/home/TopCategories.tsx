import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCatalogIndex } from "../../hooks/useCatalogIndex";
import { getImageUrl } from "../../utils/image";
import SectionHeader from "./SectionHeader";

/** "Shop from Top Categories": round image tiles with the name underneath. */
const TopCategories = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { groups, isLoading } = useCatalogIndex();

  if (!isLoading && groups.length === 0) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 mt-10 md:mt-14" aria-labelledby="home-top-categories">
      <SectionHeader
        id="home-top-categories"
        lead={t("home.top_categories_lead")}
        highlight={t("home.top_categories")}
        viewAllTo="/products"
      />

      <ul className="grid grid-cols-4 gap-x-2 gap-y-5 pt-1 md:grid-flow-col md:auto-cols-fr md:grid-cols-none md:gap-x-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="mx-auto flex w-full max-w-[76px] flex-col items-center gap-2 sm:max-w-[92px] lg:max-w-[104px]" aria-hidden="true">
                <span className="aspect-square w-full rounded-full bg-[var(--color-bg-surface)]" />
                <span className="h-3 w-14 rounded bg-[var(--color-bg-surface)]" />
              </li>
            ))
          : groups.slice(0, 8).map(({ category, image }) => {
              const name = isKh && category.name_kh ? category.name_kh : category.name;
              return (
                <li key={category.id} className="mx-auto w-full max-w-[76px] sm:max-w-[92px] lg:max-w-[104px]">
                  <Link to={`/products?category=${category.slug}`} className="group flex flex-col items-center gap-2 rounded-[var(--radius-md)]">
                    <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-full bg-[var(--color-bg-surface)] ring-offset-2 ring-offset-[var(--color-bg-primary)] transition-[box-shadow,background-color] duration-200 group-hover:bg-[var(--color-bg-sunken)] group-hover:shadow-[var(--shadow-md)] group-hover:ring-2 group-hover:ring-[var(--color-text-primary)]">
                      {image ? (
                        <img
                          src={getImageUrl(image)}
                          alt=""
                          loading="lazy"
                          className="h-[68%] w-[68%] object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-[var(--color-text-muted)]">{name.charAt(0)}</span>
                      )}
                    </span>
                    <span className="line-clamp-2 text-center text-xs font-medium leading-snug sm:text-[0.8125rem]">{name}</span>
                  </Link>
                </li>
              );
            })}
      </ul>
    </section>
  );
};

export default TopCategories;
