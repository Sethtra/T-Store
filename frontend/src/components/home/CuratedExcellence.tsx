import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLandingData } from "../../hooks/useLandingData";
import { getImageUrl } from "../../utils/image";
import { formatUSD } from "../../utils/money";

/**
 * "Spotlight" rail: products the admin pins as curated sections
 * (Admin → Landing Sections → curated_excellence). Native horizontal scroll
 * with snap; arrow buttons on wider screens.
 */
const CuratedExcellence = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const { data: landingData } = useLandingData();
  const railRef = useRef<HTMLUListElement>(null);

  const items =
    landingData?.landing_sections
      ?.filter((s) => s.section_type === "curated_excellence" && s.product)
      .sort((a, b) => a.order - b.order) || [];

  if (items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 16 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="mt-20 md:mt-28" aria-labelledby="home-spotlight">
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 mb-6 md:mb-8 flex items-end justify-between gap-4">
        <h2 id="home-spotlight" className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
          {t("home.curated_title")}
        </h2>
        {items.length > 2 && (
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border-hover)] hover:border-[var(--color-text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border-hover)] hover:border-[var(--color-text-primary)]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <ul
        ref={railRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 md:scroll-px-6 md:px-6 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))] lg:scroll-px-[max(2rem,calc((100vw-1320px)/2+2rem))]"
      >
        {items.map((item) => {
          const p = item.product;
          const title = isKh ? item.title_kh || item.title || p.title_kh || p.title : item.title || p.title || p.name;
          const tagline = isKh ? item.description_kh || item.description : item.description;
          const image = getImageUrl(item.custom_image || item.image || p.image_url || p.images?.[0]);

          return (
            <li key={item.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-2rem)/3)] max-w-[440px]">
              <Link to={`/products/${p.slug}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] transition-colors duration-300 group-hover:bg-[var(--color-bg-sunken)]">
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="pt-4">
                  {tagline && <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1">{tagline}</p>}
                  <h3 className="mt-0.5 text-lg font-semibold tracking-[-0.015em]">{title}</h3>
                  <p className="tabular mt-1 text-[0.9375rem] text-[var(--color-text-secondary)]">{formatUSD(p.price)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CuratedExcellence;
