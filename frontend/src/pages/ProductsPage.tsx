import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import {
  useProducts,
  useCategories,
  type ProductFilters,
  type Category,
} from "../hooks/useProducts";
import ProductCard from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/product/ProductCardSkeleton";
import { getImageUrl } from "../utils/image";
import { formatUSD } from "../utils/money";

const catName = (c: Category, isKh: boolean) => (isKh && c.name_kh ? c.name_kh : c.name);

const CategoryItem = ({
  category,
  depth = 0,
  currentCategory,
  onSelect,
}: {
  category: Category;
  depth?: number;
  currentCategory?: string;
  onSelect: (slug?: string) => void;
}) => {
  const { i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const hasChildren = !!category.children?.length;
  const isActive = currentCategory === category.slug;
  const isChildActive = category.children?.some((c) => c.slug === currentCategory);
  const [isOpen, setIsOpen] = useState(Boolean(isChildActive));
  const isExpanded = isOpen || Boolean(isChildActive);

  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onSelect(category.slug)}
          aria-current={isActive ? "true" : undefined}
          className={`flex-1 min-h-10 text-left rounded-[var(--radius-sm)] px-2.5 text-[0.9375rem] transition-colors ${
            isActive
              ? "font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-surface)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
        >
          {catName(category, isKh)}
        </button>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            className="grid place-items-center w-9 h-9 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)]"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {isExpanded && hasChildren && (
        <ul>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              currentCategory={currentCategory}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Map from ProductFilters property names to URL search param keys
const filterKeyToParam: Record<string, string> = {
  sortBy: "sort",
  minPrice: "min_price",
  maxPrice: "max_price",
};

/** Page numbers with gaps, e.g. 1 … 4 5 6 … 12 */
const pageWindow = (current: number, last: number): (number | "gap")[] => {
  const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
};

const ProductsPage = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filters: ProductFilters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      maxPrice: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      sortBy: (searchParams.get("sort") as ProductFilters["sortBy"]) || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: 12,
    }),
    [searchParams],
  );

  const { data: productsData, isLoading, isFetching } = useProducts(filters);
  const { data: categories } = useCategories();

  const currentCategoryObj = useMemo(() => {
    if (!filters.category || !categories) return null;
    for (const cat of categories) {
      if (cat.slug === filters.category) return cat;
      const child = cat.children?.find((c) => c.slug === filters.category);
      if (child) return child;
    }
    return null;
  }, [categories, filters.category]);

  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice?.toString() || "");

  const updateFilters = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(newFilters).forEach(([key, value]) => {
        const paramKey = filterKeyToParam[key] || key;
        if (value !== undefined && value !== null && value !== "") params.set(paramKey, String(value));
        else params.delete(paramKey);
      });
      if (!newFilters.page) params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Sync URL → local inputs (back/forward navigation)
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLocalSearch(filters.search || "");
      setLocalMinPrice(filters.minPrice?.toString() || "");
      setLocalMaxPrice(filters.maxPrice?.toString() || "");
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || "")) updateFilters({ search: localSearch || undefined });
    }, 450);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, updateFilters]);

  // Lock page scroll while the mobile filter sheet is open
  useEffect(() => {
    if (!isFilterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isFilterOpen]);

  const handlePriceFilter = () => {
    updateFilters({
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchParams(new URLSearchParams());
  };

  const total = productsData?.meta.total ?? 0;
  const title = currentCategoryObj ? catName(currentCategoryObj, isKh) : t("products.title");

  const activeChips = [
    filters.search && { key: "search", label: `“${filters.search}”`, clear: () => updateFilters({ search: undefined }) },
    currentCategoryObj && {
      key: "category",
      label: catName(currentCategoryObj, isKh),
      clear: () => updateFilters({ category: undefined }),
    },
    (filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      key: "price",
      label:
        filters.minPrice !== undefined && filters.maxPrice !== undefined
          ? `${formatUSD(filters.minPrice)} – ${formatUSD(filters.maxPrice)}`
          : filters.minPrice !== undefined
            ? `≥ ${formatUSD(filters.minPrice)}`
            : `≤ ${formatUSD(filters.maxPrice)}`,
      clear: () => updateFilters({ minPrice: undefined, maxPrice: undefined }),
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const sectionTitle = "text-sm font-semibold text-[var(--color-text-primary)] mb-2";
  const fieldClass =
    "w-full h-11 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] bg-[var(--color-bg-primary)] px-3 text-[0.9375rem] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-primary)]";

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <label htmlFor="product-search" className={sectionTitle + " block"}>
          {t("products.search")}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            id="product-search"
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t("nav.search")}
            className={fieldClass + " pl-9"}
          />
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <h2 className={sectionTitle}>{t("products.categories")}</h2>
          <ul className="-mx-1">
            <li>
              <button
                type="button"
                onClick={() => updateFilters({ category: undefined })}
                aria-current={!filters.category ? "true" : undefined}
                className={`w-full min-h-10 text-left rounded-[var(--radius-sm)] px-2.5 text-[0.9375rem] transition-colors ${
                  !filters.category
                    ? "font-semibold bg-[var(--color-bg-surface)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {t("products.all_categories")}
              </button>
            </li>
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                currentCategory={filters.category}
                onSelect={(slug) => updateFilters({ category: slug })}
              />
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className={sectionTitle}>{t("products.price_range")}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePriceFilter();
            setIsFilterOpen(false);
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="relative">
              <span className="sr-only">Min</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className={fieldClass + " pl-6 tabular"}
              />
            </label>
            <label className="relative">
              <span className="sr-only">Max</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className={fieldClass + " pl-6 tabular"}
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 w-full h-11 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] text-sm font-semibold hover:border-[var(--color-text-primary)]"
          >
            {t("products.apply")}
          </button>
        </form>
      </div>

      {activeChips.length > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-[var(--color-text-secondary)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
        >
          {t("products.clear_all")}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10 pb-8">
      {currentCategoryObj?.banner_image && (
        <div className="mb-8 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)]">
          <img
            src={getImageUrl(currentCategoryObj.banner_image)}
            alt=""
            className="h-40 w-full object-cover md:h-56"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{title}</h1>
          <p className="mt-1 text-[0.9375rem] text-[var(--color-text-secondary)]" aria-live="polite">
            {isLoading ? " " : t("products.found_count", { count: total })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] px-4 text-sm font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("products.filters")}
            {activeChips.length > 0 && (
              <span className="tabular grid place-items-center min-w-5 h-5 px-1 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[11px]">
                {activeChips.length}
              </span>
            )}
          </button>
          <label className="relative">
            <span className="sr-only">Sort</span>
            <select
              value={filters.sortBy || ""}
              onChange={(e) => updateFilters({ sortBy: (e.target.value || undefined) as ProductFilters["sortBy"] })}
              className="h-11 appearance-none rounded-[var(--radius-md)] border border-[var(--color-border-hover)] bg-[var(--color-bg-primary)] pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-[var(--color-text-primary)]"
            >
              <option value="">{t("products.sort_default")}</option>
              <option value="price_asc">{t("products.sort_price_asc")}</option>
              <option value="price_desc">{t("products.sort_price_desc")}</option>
              <option value="newest">{t("products.sort_newest")}</option>
              <option value="popular">{t("products.sort_popular")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          </label>
        </div>
      </div>

      {activeChips.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-4" aria-label="Active filters">
          {activeChips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={chip.clear}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--color-bg-surface)] pl-3 pr-2 text-sm font-medium hover:bg-[var(--color-bg-sunken)]"
              >
                {chip.label}
                <X className="w-3.5 h-3.5" aria-label="Remove" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-10 pt-6 lg:pt-8">
        <aside className="hidden lg:block w-60 shrink-0" aria-label={t("products.filters")}>
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        <div className={`flex-1 min-w-0 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : productsData?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] px-6 py-20 text-center">
              <Search className="w-8 h-8 text-[var(--color-text-muted)]" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">{t("product.not_found")}</h2>
              <p className="mt-2 max-w-md text-[var(--color-text-secondary)]">
                {isKh
                  ? "សាកល្បងកែសម្រួលការកំណត់របស់អ្នក ឬស្វែងរកពាក្យផ្សេង។"
                  : "Nothing matches these filters. Try a different search or clear the filters."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-on-primary)]"
              >
                {t("products.clear_all")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:gap-5">
                {productsData?.data.map((product) => (
                  <ProductCard
                    key={product.id}
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
                    specs={product.specs}
                    colors={product.colors}
                    variants={product.active_variants}
                  />
                ))}
              </div>

              {productsData && productsData.meta.last_page > 1 && (
                <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={productsData.meta.current_page === 1}
                    onClick={() => updateFilters({ page: productsData.meta.current_page - 1 })}
                    aria-label="Previous page"
                    className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-surface)] disabled:opacity-35 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {pageWindow(productsData.meta.current_page, productsData.meta.last_page).map((page, i) =>
                    page === "gap" ? (
                      <span key={`gap-${i}`} className="w-8 text-center text-[var(--color-text-muted)]">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => updateFilters({ page })}
                        aria-current={productsData.meta.current_page === page ? "page" : undefined}
                        className={`tabular w-10 h-10 rounded-[var(--radius-md)] text-sm font-semibold transition-colors ${
                          productsData.meta.current_page === page
                            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={productsData.meta.current_page === productsData.meta.last_page}
                    onClick={() => updateFilters({ page: productsData.meta.current_page + 1 })}
                    aria-label="Next page"
                    className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-surface)] disabled:opacity-35 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-[70] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("products.filters")}
              className="lg:hidden fixed inset-x-0 bottom-0 z-[71] max-h-[88dvh] flex flex-col rounded-t-[var(--radius-lg)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-lg)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)] shrink-0">
                <h2 className="text-base font-semibold">{t("products.filters")}</h2>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close"
                  className="grid place-items-center w-10 h-10 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-surface)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">{filterPanel}</div>
              <div className="shrink-0 border-t border-[var(--color-border)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-primary)] font-semibold text-[var(--color-on-primary)]"
                >
                  {isKh ? `បង្ហាញ ${total} ផលិតផល` : `Show ${total} products`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;
