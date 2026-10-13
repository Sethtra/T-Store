import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLandingData } from "../../hooks/useLandingData";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { getImageUrl } from "../../utils/image";
import { formatUSD } from "../../utils/money";

const HeroSkeleton = () => (
  <section aria-hidden="true" className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-12">
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5 space-y-4">
        <div className="h-12 w-4/5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
        <div className="h-12 w-3/5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
        <div className="h-5 w-full max-w-md rounded bg-[var(--color-bg-surface)]" />
        <div className="h-11 w-44 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
      </div>
      <div className="lg:col-span-7 aspect-[4/3] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)]" />
    </div>
  </section>
);

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { data: landingData, isLoading: landingLoading } = useLandingData();
  const { data: siteSettings, isLoading: settingsLoading } = useSiteSettings();

  if (landingLoading || settingsLoading) return <HeroSkeleton />;

  // Copy is managed in Admin → Settings; fall back to the bundled defaults.
  const heroTitle = isKh
    ? siteSettings?.hero_title_kh || t("hero.default_title")
    : siteSettings?.hero_title || t("hero.default_title");
  const heroSubtitle = isKh
    ? siteSettings?.hero_subtitle_kh || t("hero.default_subtitle")
    : siteSettings?.hero_subtitle || t("hero.default_subtitle");
  const heroDescription = isKh
    ? siteSettings?.hero_description_kh || t("hero.default_description")
    : siteSettings?.hero_description || t("hero.default_description");

  const heroMain = landingData?.landing_sections?.find((s) => s.section_type === "hero_main" && s.product);
  const p = heroMain?.product;
  const productTitle = p ? (isKh ? p.title_kh || p.title || p.name : p.title || p.name) : "";
  const productImage = getImageUrl(heroMain?.custom_image || p?.image_url || p?.images?.[0]);

  return (
    <section className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-5 rise-in">
          <h1 className="text-[clamp(2.5rem,5.2vw,4.5rem)] font-[680] leading-[1.02] tracking-[-0.035em]">
            {heroTitle} {heroSubtitle}
          </h1>
          <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)] md:text-lg">
            {heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-semibold text-[var(--color-on-primary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              {t("home.shop_all")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {p && (
              <Link
                to={`/products/${p.slug}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] px-6 font-semibold transition-colors hover:border-[var(--color-text-primary)]"
              >
                {t("home.view_product")}
              </Link>
            )}
          </div>
        </div>

        {p ? (
          <Link
            to={`/products/${p.slug}`}
            className="group relative block overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] lg:col-span-7 rise-in [animation-delay:90ms]"
          >
            <div className="aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={productImage}
                alt=""
                fetchPriority="high"
                className="h-full w-full object-contain p-[8%] pb-[16%] transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold sm:text-lg">{productTitle}</p>
                <p className="tabular text-sm text-[var(--color-text-secondary)] sm:text-[0.9375rem]">
                  {formatUSD(p.price)}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-bg-primary)] shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="sr-only">{t("home.view_product")}</span>
              </span>
            </div>
          </Link>
        ) : (
          <div className="hidden lg:block lg:col-span-7 aspect-[16/11] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)]" />
        )}
      </div>

      {/* What's true about shopping here */}
      <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-border)] text-sm sm:grid-cols-3 md:mt-10">
        {[
          { key: "facts_khqr", icon: <KhqrIcon /> },
          { key: "facts_delivery", icon: <TruckIcon /> },
          { key: "facts_language", icon: <LangIcon /> },
        ].map(({ key, icon }) => (
          <li key={key} className="flex items-center gap-3 bg-[var(--color-bg-primary)] px-4 py-3.5 sm:justify-center">
            <span className="text-[var(--color-text-secondary)]">{icon}</span>
            <span className="font-medium">{t(`home.${key}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

/* Small line icons drawn to match lucide's 1.75 stroke */
const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const KhqrIcon = () => (
  <svg {...svgProps}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <path d="M14 14h3v3h-3zM20 14v.01M17 20h4v-3M14 20v.01" />
  </svg>
);

const TruckIcon = () => (
  <svg {...svgProps}>
    <path d="M3 6.5h11v9H3zM14 9.5h3.6l3.4 3.4v2.6h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

const LangIcon = () => (
  <svg {...svgProps}>
    <path d="M4 5h9M8.5 3v2M11 5c-.8 3.6-3.2 6.4-6.5 8" />
    <path d="M6.5 8.5c1.2 1.8 2.9 3.2 4.8 4" />
    <path d="M13 21l3.8-9 3.8 9M14.3 18h5" />
  </svg>
);

export default HeroSection;
