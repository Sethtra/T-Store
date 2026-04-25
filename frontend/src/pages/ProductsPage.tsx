import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useProducts,
  useCategories,
  type ProductFilters,
  type Category,
} from "../hooks/useProducts";
import ProductCard from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/product/ProductCardSkeleton";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../utils/image";

// Recursive Category Item Component
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
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  // Check if this category or any child is active
  const isActive = currentCategory === category?.slug;
  const isChildActive = category.children?.some(
    (c) => c?.slug === currentCategory,
  );

  // Auto-expand if child is active
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  return (
    <div className="select-none">
      <div
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          isActive
            ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => onSelect(category?.slug)}
      >
        <span>{isKh && category.name_kh ? category.name_kh : category.name}</span>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`p-1 rounded-full hover:bg-white/20 transition-colors ${isActive ? "text-white" : ""}`}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {category.children!.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                depth={depth + 1}
                currentCategory={currentCategory}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Tree Component
const CategoryTree = ({
  categories,
  currentCategory,
  onSelect,
}: {
  categories: Category[];
  currentCategory?: string;
  onSelect: (slug?: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(undefined)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          !currentCategory
            ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        {t("products.all_categories")}
      </button>
      {categories.map((cat) => (
        <CategoryItem
          key={cat.id}
          category={cat}
          currentCategory={currentCategory}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

const BackgroundElements = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05], rotate: [0, 45, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-primary)] blur-[120px]"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.1, 0.03], rotate: [0, -45, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-500 blur-[100px]"
    />
  </div>
);

const ProductsPage = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Track window resize reactively
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extract filters from URL
  const filters: ProductFilters = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("min_price")
        ? Number(searchParams.get("min_price"))
        : undefined,
      maxPrice: searchParams.get("max_price")
        ? Number(searchParams.get("max_price"))
        : undefined,
      sortBy:
        (searchParams.get("sort") as ProductFilters["sortBy"]) || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: 12,
    }),
    [searchParams],
  );

  const { data: productsData, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();

  // Find the currently selected category object based on URL filters
  const currentCategoryObj = useMemo(() => {
    if (!filters.category || !categories) return null;
    for (const cat of categories) {
      if (cat.slug === filters.category) return cat;
      if (cat.children) {
        const child = cat.children.find(c => c.slug === filters.category);
        if (child) return child;
      }
    }
    return null;
  }, [categories, filters.category]);

  // Local filter state
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [localMinPrice, setLocalMinPrice] = useState(
    filters.minPrice?.toString() || "",
  );
  const [localMaxPrice, setLocalMaxPrice] = useState(
    filters.maxPrice?.toString() || "",
  );

  // Sync URL to local state (for back/forward navigation)
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Auto-search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || "")) {
        updateFilters({ search: localSearch || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: localSearch || undefined });
  };

  // Map from ProductFilters property names to URL search param keys
  const filterKeyToParam: Record<string, string> = {
    sortBy: "sort",
    minPrice: "min_price",
    maxPrice: "max_price",
    // These map 1:1 so no entry needed: search, category, page, limit
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      const paramKey = filterKeyToParam[key] || key;
      if (value !== undefined && value !== null && value !== "") {
        params.set(paramKey, String(value));
      } else {
        params.delete(paramKey);
      }
    });

    // Reset to page 1 when filters change
    if (!newFilters.page) {
      params.set("page", "1");
    }

    setSearchParams(params);
  };

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--color-bg-base)] z-0 pb-32" style={{ paddingTop: "128px" }}>
      <BackgroundElements />
      <div className="container relative z-10">
      {/* Category Banner */}
      {currentCategoryObj?.banner_image && (
        <div className="w-full h-48 md:h-64 rounded-2xl md:rounded-[2rem] overflow-hidden relative mb-8 border border-[var(--color-border)] shadow-sm group">
          <img
            src={getImageUrl(currentCategoryObj.banner_image)}
            alt={isKh && currentCategoryObj.name_kh ? currentCategoryObj.name_kh : currentCategoryObj.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
              {isKh && currentCategoryObj.name_kh ? currentCategoryObj.name_kh : currentCategoryObj.name}
            </h1>
            <p className="text-white/90 mt-2 text-sm md:text-base font-medium">
              {t("products.found_count", { count: productsData?.meta.total || 0 })}
            </p>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className={`flex flex-col md:flex-row ${!currentCategoryObj?.banner_image ? "md:items-center" : "md:items-end md:justify-end"} justify-between gap-4 mb-8`}>
        {!currentCategoryObj?.banner_image && (
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{t("products.title")}</h1>
            <p className="text-[var(--color-text-muted)] mt-1 text-base">
              {t("products.found_count", { count: productsData?.meta.total || 0 })}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={filters.sortBy || ""}
            onChange={(e) =>
              updateFilters({
                sortBy: e.target.value as ProductFilters["sortBy"],
              })
            }
            className="px-4 py-2.5 bg-[var(--color-bg-elevated)]/70 backdrop-blur-sm border border-[var(--color-border)]/60 rounded-xl text-sm font-medium focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          >
            <option value="">{t("products.sort_default")}</option>
            <option value="price_asc">{t("products.sort_price_asc")}</option>
            <option value="price_desc">{t("products.sort_price_desc")}</option>
            <option value="newest">{t("products.sort_newest")}</option>
            <option value="popular">{t("products.sort_popular")}</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg-elevated)]/70 backdrop-blur-sm border border-[var(--color-border)]/60 rounded-xl text-sm font-medium hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t("products.filters")}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {(isFilterOpen || isDesktop) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`lg:w-72 flex-shrink-0 ${
                isFilterOpen
                  ? "fixed inset-0 z-50 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl p-6 lg:relative lg:p-0 overflow-y-auto"
                  : "hidden lg:block"
              }`}
            >
              {/* Mobile Close Button */}
              {isFilterOpen && (
                <div className="flex items-center justify-between lg:hidden mb-6">
                  <h2 className="text-xl font-bold">{t("products.filters")}</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="bg-[var(--color-bg-elevated)]/60 backdrop-blur-xl rounded-2xl border border-[var(--color-border)]/50 p-5 space-y-6">
                {/* Search */}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{t("products.search")}</h3>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <Input
                        placeholder={t("products.search") + "..."}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="pl-10 bg-[var(--color-bg-surface)] border-[var(--color-border)]/50 rounded-xl text-[var(--color-text-primary)] transition-all focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </form>
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--color-border)]/50" />

                {/* Categories */}
                {categories && categories.length > 0 && (
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{t("products.categories")}</h3>
                    <CategoryTree
                      categories={categories}
                      currentCategory={filters.category}
                      onSelect={(slug) => updateFilters({ category: slug })}
                    />
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-[var(--color-border)]/50" />

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{t("products.price_range")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                      className="bg-[var(--color-bg-surface)] border-[var(--color-border)]/50 rounded-xl transition-all focus:border-[var(--color-primary)]"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                      className="bg-[var(--color-bg-surface)] border-[var(--color-border)]/50 rounded-xl transition-all focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <Button
                    onClick={handlePriceFilter}
                    fullWidth
                    className="mt-3 rounded-xl"
                    size="sm"
                  >
                    {t("products.apply")}
                  </Button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--color-border)]/50" />

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full text-center text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors py-1"
                >
                  {t("products.clear_all")}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : productsData?.data.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-4 bg-[var(--color-bg-elevated)]/40 backdrop-blur-xl border border-[var(--color-border)]/50 rounded-[2.5rem] flex flex-col items-center justify-center max-w-2xl mx-auto mt-10"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center border border-[var(--color-border)]/50 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[var(--color-text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text-primary)]">{t("product.not_found")}</h3>
              <p className="text-[var(--color-text-muted)] mb-8 text-lg max-w-md">
                {isKh ? "សាកល្បងកែសម្រួលការកំណត់របស់អ្នក ឬស្វែងរកពាក្យផ្សេង" : "We couldn't find any products matching your current filters. Try adjusting them or clear all filters to see more."}
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8 hover:bg-[var(--color-bg-surface)] transition-colors border border-[var(--color-border)]">
                {t("products.clear_all")}
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {productsData?.data.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      id={product.id}
                      slug={product?.slug}
                      title={product.title}
                      title_kh={product.title_kh}
                      description={product.description}
                      description_kh={product.description_kh}
                      price={product.price}
                      image={product?.images?.[0] || "/placeholder.jpg"}
                      category={product.category?.name}
                      category_kh={product.category?.name_kh}
                      stock={product.stock}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {productsData && productsData.meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-12">
                  <button
                    disabled={productsData.meta.current_page === 1}
                    onClick={() =>
                      updateFilters({
                        page: productsData.meta.current_page - 1,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)]/50 hover:bg-[var(--color-bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ←
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({
                      length: Math.min(5, productsData.meta.last_page),
                    }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => updateFilters({ page })}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                            productsData.meta.current_page === page
                              ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/25"
                              : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={
                      productsData.meta.current_page ===
                      productsData.meta.last_page
                    }
                    onClick={() =>
                      updateFilters({
                        page: productsData.meta.current_page + 1,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)]/50 hover:bg-[var(--color-bg-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductsPage;
