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
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  // Check if this category or any child is active
  const isActive = currentCategory === category.slug;
  const isChildActive = category.children?.some(
    (c) => c.slug === currentCategory,
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
        onClick={() => onSelect(category.slug)}
      >
        <span>{category.name}</span>
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
        All Categories
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

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
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
      min_price: localMinPrice ? Number(localMinPrice) : undefined,
      max_price: localMaxPrice ? Number(localMaxPrice) : undefined,
    } as unknown as Partial<ProductFilters>);
  };

  const clearFilters = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchParams(new URLSearchParams());
  };

  const sortOptions = [
    { value: "", label: "Default" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
  ];

  return (
    <div className="container pb-32" style={{ paddingTop: "128px" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {productsData?.meta.total || 0} products found
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={filters.sortBy || ""}
            onChange={(e) =>
              updateFilters({
                sortBy: e.target.value as ProductFilters["sortBy"],
              })
            }
            className="px-4 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Mobile Filter Toggle */}
          <Button
            variant="secondary"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`lg:w-64 flex-shrink-0 space-y-6 ${
                isFilterOpen
                  ? "fixed inset-0 z-50 bg-[var(--color-bg-primary)] p-6 lg:relative lg:p-0"
                  : "hidden lg:block"
              }`}
            >
              {/* Mobile Close Button */}
              {isFilterOpen && (
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Search */}
              <div className="pb-6 border-b border-[var(--color-border)]">
                <h3 className="font-semibold mb-3 text-lg">Search</h3>
                <form onSubmit={handleSearch}>
                  <Input
                    placeholder="Search products..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="bg-[var(--color-bg-secondary)] border-transparent text-[var(--color-text-primary)] transition-all focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    className="mt-3 bg-black text-white hover:bg-gray-800"
                    size="sm"
                  >
                    Search
                  </Button>
                </form>
              </div>

              {/* Categories */}
              {categories && categories.length > 0 && (
                <div className="pb-6 border-b border-[var(--color-border)]">
                  <h3 className="font-semibold mb-3 text-lg">Categories</h3>
                  <div className="space-y-1">
                    <CategoryTree
                      categories={categories}
                      currentCategory={filters.category}
                      onSelect={(slug) => updateFilters({ category: slug })}
                    />
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="pb-6">
                <h3 className="font-semibold mb-3 text-lg">Price Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="bg-[var(--color-bg-secondary)] border-transparent focus:bg-white transition-all"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="bg-[var(--color-bg-secondary)] border-transparent focus:bg-white transition-all"
                  />
                </div>
                <Button
                  onClick={handlePriceFilter}
                  fullWidth
                  className="mt-3 bg-black text-white hover:bg-gray-800"
                  size="sm"
                >
                  Apply Filter
                </Button>
              </div>

              {/* Clear Filters */}
              <Button variant="ghost" fullWidth onClick={clearFilters}>
                Clear All Filters
              </Button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : productsData?.data.length === 0 ? (
            <div className="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-[var(--color-text-muted)] mb-4"
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
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-[var(--color-text-muted)] mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {productsData?.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    image={product.images[0] || "/placeholder.jpg"}
                    category={product.category?.name}
                    stock={product.stock}
                    description={product.description}
                  />
                ))}
              </div>

              {/* Pagination */}
              {productsData && productsData.meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={productsData.meta.current_page === 1}
                    onClick={() =>
                      updateFilters({
                        page: productsData.meta.current_page - 1,
                      })
                    }
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({
                      length: Math.min(5, productsData.meta.last_page),
                    }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => updateFilters({ page })}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            productsData.meta.current_page === page
                              ? "bg-[var(--color-primary)] text-white"
                              : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={
                      productsData.meta.current_page ===
                      productsData.meta.last_page
                    }
                    onClick={() =>
                      updateFilters({
                        page: productsData.meta.current_page + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
