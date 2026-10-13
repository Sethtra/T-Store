import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useLandingData, type CategoryDisplay } from "../../hooks/useLandingData";
import { getImageUrl } from "../../utils/image";

interface BrowseByCategoriesProps {
  customDisplays?: CategoryDisplay[];
}

// Shown only until the four slots are configured in Admin → Category Display.
const DEFAULT_DISPLAYS: Record<string, CategoryDisplay> = {
  main: {
    id: 1,
    position: "main",
    title: "Smartphones",
    title_kh: "ទូរស័ព្ទស្មាតហ្វូន",
    description: "Flagships and everyday phones.",
    description_kh: "ទូរស័ព្ទកម្រិតខ្ពស់ និងប្រើប្រាស់ប្រចាំថ្ងៃ។",
    image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
    link: "/products",
    is_active: true,
  },
  featured: {
    id: 2,
    position: "featured",
    title: "Laptops",
    title_kh: "កុំព្យូទ័រយួរដៃ",
    description: "For work and study.",
    description_kh: "សម្រាប់ការងារ និងការសិក្សា។",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    link: "/products",
    is_active: true,
  },
  small_1: {
    id: 3,
    position: "small_1",
    title: "Audio",
    title_kh: "សំឡេង",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    link: "/products",
    is_active: true,
  },
  small_2: {
    id: 4,
    position: "small_2",
    title: "Accessories",
    title_kh: "គ្រឿងបន្លាស់",
    image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
    link: "/products",
    is_active: true,
  },
};

const linkFor = (d: CategoryDisplay) =>
  d.link || (d.category?.slug ? `/products?category=${d.category.slug}` : "/products");

const Tile = ({
  display,
  size,
  isKh,
  shopLabel,
}: {
  display: CategoryDisplay;
  size: "large" | "wide" | "small";
  isKh: boolean;
  shopLabel: string;
}) => {
  const title = isKh ? display.title_kh || display.title : display.title;
  const description = isKh ? display.description_kh || display.description : display.description;

  return (
    <Link
      to={linkFor(display)}
      className={`group relative flex overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] transition-colors duration-300 hover:bg-[var(--color-bg-sunken)] ${
        size === "large"
          ? "min-h-[300px] flex-col sm:min-h-[420px] lg:h-full"
          : size === "wide"
            ? "min-h-[200px] flex-row items-stretch"
            : "min-h-[220px] flex-col"
      }`}
    >
      <div
        className={`relative z-10 flex flex-col p-5 sm:p-6 ${
          size === "wide" ? "w-1/2 justify-between" : ""
        } ${size === "large" ? "lg:p-8" : ""}`}
      >
        <div>
          <h3 className={`font-semibold tracking-[-0.02em] ${size === "large" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
            {title}
          </h3>
          {description && size !== "small" && (
            <p className="mt-1.5 line-clamp-2 max-w-xs text-sm text-[var(--color-text-secondary)]">{description}</p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${size === "wide" ? "mt-4" : "mt-3"}`}>
          {shopLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div
        className={`relative flex items-center justify-center ${
          size === "wide" ? "w-1/2 p-4" : "flex-1 px-6 pb-6"
        }`}
      >
        <img
          src={getImageUrl(display.image_url || "")}
          alt=""
          loading="lazy"
          className={`object-contain transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04] ${
            size === "large" ? "max-h-[220px] sm:max-h-[300px] w-full" : size === "wide" ? "max-h-[170px] w-full" : "max-h-[130px] w-full"
          }`}
          onError={(e) => {
            const fallback = DEFAULT_DISPLAYS[display.position]?.image_url;
            if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
          }}
        />
      </div>
    </Link>
  );
};

const BrowseByCategories = ({ customDisplays }: BrowseByCategoriesProps = {}) => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { data: landingData } = useLandingData();
  const displays = customDisplays || landingData?.category_displays;

  const get = (position: string): CategoryDisplay =>
    displays?.find((d) => d.position === position && d.is_active !== false) || DEFAULT_DISPLAYS[position];

  const shopLabel = t("home.shop");

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 mt-20 md:mt-28" aria-labelledby="home-categories">
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <h2 id="home-categories" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
          {t("home.categories_title")}
        </h2>
        <Link
          to="/products"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline underline-offset-4"
        >
          {t("home.view_all")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:grid-rows-2 lg:h-[600px]">
        <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
          <Tile display={get("main")} size="large" isKh={isKh} shopLabel={shopLabel} />
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <Tile display={get("featured")} size="wide" isKh={isKh} shopLabel={shopLabel} />
        </div>
        <Tile display={get("small_1")} size="small" isKh={isKh} shopLabel={shopLabel} />
        <Tile display={get("small_2")} size="small" isKh={isKh} shopLabel={shopLabel} />
      </div>
    </section>
  );
};

export default BrowseByCategories;
