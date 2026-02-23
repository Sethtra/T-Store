import { useState, useMemo, memo, useCallback, useEffect } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
  type Category,
} from "../../hooks/useProducts";
import { useAdminCategories } from "../../hooks/useCategories";
import AdminLayout from "../../components/admin/AdminLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

// Helper for status
const getStockStatus = (stock: number) => {
  if (stock === 0)
    return { label: "Out of Stock", color: "bg-red-500/20 text-red-400" };
  if (stock <= 10)
    return { label: "Low Stock", color: "bg-yellow-500/20 text-yellow-400" };
  return { label: "In Stock", color: "bg-green-500/20 text-green-400" };
};

// Memoized Row Component
const ProductRow = memo(
  ({
    product,
    onEdit,
    onDelete,
    categories,
  }: {
    product: Product;
    onEdit: (p: Product) => void;
    onDelete: (id: number) => void;
    categories?: Category[];
  }) => {
    // Find parent and sub-category names
    const getCategoryInfo = () => {
      if (!product.category_id || !categories)
        return { parent: null, sub: null };
      // Check if product.category is a parent
      for (const parent of categories) {
        if (parent.id === product.category_id) {
          return { parent: parent.name, sub: null };
        }
        if (parent.children) {
          const child = parent.children.find(
            (c) => c.id === product.category_id,
          );
          if (child) {
            return { parent: parent.name, sub: child.name };
          }
        }
      }
      // Fallback: use product.category directly
      return { parent: product.category?.name || null, sub: null };
    };
    const categoryInfo = getCategoryInfo();
    const stockStatus = getStockStatus(product.stock);
    return (
      <tr className="hover:bg-[var(--color-bg-surface)]/50 transition-colors">
        {/* Product Name */}
        <td className="px-6 py-4">
          <div className="font-medium text-[var(--color-text-primary)]">
            {product.title}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
            ID: #{product.id}
          </div>
        </td>

        {/* Image */}
        <td className="px-4 py-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-bg-surface)] shrink-0">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transform-gpu"
                loading="lazy"
                decoding="async"
                width="48"
                height="48"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </td>
        {/* Description */}
        <td className="px-4 py-4 max-w-xs transition-colors">
          <div
            className="text-sm text-[var(--color-text-secondary)] line-clamp-2"
            title={product.description}
          >
            {product.description || (
              <span className="text-[var(--color-text-muted)] italic">
                No description
              </span>
            )}
          </div>
        </td>
        {/* Category */}
        <td className="px-4 py-4">
          {categoryInfo.parent ? (
            <div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {categoryInfo.parent}
              </div>
              {categoryInfo.sub && (
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  └ {categoryInfo.sub}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)] italic">
              Uncategorized
            </span>
          )}
        </td>
        {/* Price */}
        <td className="px-4 py-4">
          <span className="font-semibold text-[var(--color-text-primary)]">
            ${Number(product.price || 0).toFixed(2)}
          </span>
        </td>
        {/* Stock */}
        <td className="px-4 py-4">
          <span className="text-[var(--color-text-primary)]">
            {product.stock}
          </span>
        </td>
        {/* Status */}
        <td className="px-4 py-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
          >
            {stockStatus.label}
          </span>
        </td>
        {/* Actions */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  },
);

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // Fetch data
  const { data: productsData, isLoading } = useProducts({ page, limit: 12 });
  const { data: categories } = useAdminCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Scroll to top when page changes
  useEffect(() => {
    document
      .getElementById("admin-main-content")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Form State
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
    attributes: {} as Record<string, string | string[]>,
  });
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  // Build flat list of sub-categories for the selected parent
  const subCategories = useMemo(() => {
    if (!selectedCategory || !categories) return [];
    const parent = categories.find((c) => c.id.toString() === selectedCategory);
    return parent?.children || [];
  }, [selectedCategory, categories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Sub-category filter takes priority
      if (selectedSubCategory) {
        return (
          matchesSearch &&
          product.category_id?.toString() === selectedSubCategory
        );
      }

      // Parent category filter: match the parent itself OR any of its children
      if (selectedCategory) {
        const parent = categories?.find(
          (c) => c.id.toString() === selectedCategory,
        );
        const childIds = parent?.children?.map((c) => c.id) || [];
        const parentId = Number(selectedCategory);
        const matchesCategory =
          product.category_id === parentId ||
          childIds.includes(product.category_id ?? -1);
        return matchesSearch && matchesCategory;
      }

      return matchesSearch;
    });
  }, [
    productsData,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    categories,
  ]);

  const [attributeRows, setAttributeRows] = useState<
    { id: number; key: string; value: string }[]
  >([]);

  // Modal & Form Handlers
  const openCreateModal = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image_url: "",
      attributes: {},
    });
    setAttributeRows([]);
    setSelectedParentId("");
    setSelectedImages([]);
    setExistingImages([]);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (product: Product) => {
      setEditingProduct(product);

      let parentId = "";
      if (product.category_id && categories) {
        for (const parent of categories) {
          if (parent.id === product.category_id) {
            parentId = parent.id.toString();
            break;
          }
          if (parent.children) {
            const child = parent.children.find(
              (c) => c.id === product.category_id,
            );
            if (child) {
              parentId = parent.id.toString();
              break;
            }
          }
        }
      }

      // Convert attributes object to rows
      const initialRows = Object.entries(product.attributes || {}).map(
        ([key, value], index) => ({
          id: index,
          key,
          value: Array.isArray(value) ? value.join(", ") : String(value),
        }),
      );

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price?.toString() || "0",
        stock: product.stock?.toString() || "0",
        category_id: product.category_id?.toString() || "",
        image_url: product.images?.[0] || "",
        attributes: product.attributes || {},
      });
      setAttributeRows(initialRows);
      setSelectedParentId(parentId);
      setSelectedImages([]);
      setExistingImages(product.images || []);
      setIsModalOpen(true);
    },
    [categories],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        if (formData.category_id)
          data.append("category_id", formData.category_id);

        if (existingImages.length > 0) {
          data.append("existing_images", JSON.stringify(existingImages));
        } else if (editingProduct) {
          data.append("existing_images", JSON.stringify([]));
        }

        selectedImages.forEach((file) => data.append("images[]", file));

        // Convert attribute rows back to object
        const attributesObj: Record<string, string> = {};
        attributeRows.forEach((row) => {
          if (row.key.trim()) {
            attributesObj[row.key.trim()] = row.value.trim();
          }
        });

        if (Object.keys(attributesObj).length > 0) {
          data.append("attributes", JSON.stringify(attributesObj));
        }

        if (editingProduct) {
          data.append("_method", "PUT");
          await updateProduct.mutateAsync({
            id: editingProduct.id,
            data: data as any,
          });
        } else {
          await createProduct.mutateAsync(data as any);
        }
        setIsModalOpen(false);
      } catch (error: any) {
        console.error("Failed", error);
        alert(error.response?.data?.message || "Failed to save product.");
      }
    },
    [
      formData,
      existingImages,
      selectedImages,
      editingProduct,
      updateProduct,
      createProduct,
      attributeRows,
    ],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (window.confirm("Delete this product?")) {
        try {
          await deleteProduct.mutateAsync(id);
        } catch (error) {
          console.error(error);
          alert("Failed to delete.");
        }
      }
    },
    [deleteProduct],
  );

  const subcategories =
    categories?.find((c) => c.id.toString() === selectedParentId)?.children ||
    [];

  // Attribute Handlers
  const addAttribute = () => {
    setAttributeRows([
      ...attributeRows,
      { id: Date.now(), key: "", value: "" },
    ]);
  };

  const removeAttribute = (id: number) => {
    setAttributeRows(attributeRows.filter((row) => row.id !== id));
  };

  const updateAttributeRow = (
    id: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    setAttributeRows(
      attributeRows.map((row) =>
        row.id === id ? { ...row, [field]: newValue } : row,
      ),
    );
  };

  return (
    <AdminLayout>
      <div className="w-full px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Products
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Manage your inventory ({productsData?.meta.total || 0} total)
            </p>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          {/* Table Header with Search */}
          <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              All Products
            </h2>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory(""); // Reset sub-category when parent changes
                }}
                className="px-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Sub-Category Filter - Only visible when a parent category is selected */}
              {subCategories.length > 0 && (
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="px-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">All Sub-Categories</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              )}

              <Button onClick={openCreateModal} className="flex-shrink-0 ml-2">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Product
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-surface)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Product
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-[var(--color-text-muted)]"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-[var(--color-text-muted)]"
                    >
                      No products found.
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("");
                          setSelectedSubCategory("");
                        }}
                        className="ml-2 text-[var(--color-primary)] hover:underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      categories={categories}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination - Duralux Style */}
          {productsData && productsData.meta.last_page > 1 && (
            <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Current Page */}
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-blue-500/30">
                {page}
              </button>

              {/* Next Page Number */}
              {page < productsData.meta.last_page && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all"
                >
                  {page + 1}
                </button>
              )}

              {/* Ellipsis and Last Page */}
              {productsData.meta.last_page > page + 2 && (
                <>
                  <div className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]"></div>
                  <button
                    onClick={() => setPage(productsData.meta.last_page)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all"
                  >
                    {productsData.meta.last_page}
                  </button>
                </>
              )}

              {/* Next Button */}
              <button
                onClick={() =>
                  setPage((p) => Math.min(productsData.meta.last_page, p + 1))
                }
                disabled={page >= productsData.meta.last_page}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-[var(--color-text-primary)]">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                      value={selectedParentId}
                      onChange={(e) => {
                        setSelectedParentId(e.target.value);
                        setFormData({ ...formData, category_id: "" });
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-[var(--color-text-primary)]">
                      Subcategory
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Type</option>
                      {subcategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Attributes Builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                      Attributes
                    </label>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="text-xs text-[var(--color-primary)] hover:underline"
                    >
                      + Add Attribute
                    </button>
                  </div>
                  <div className="space-y-2">
                    {attributeRows.map((row) => (
                      <div key={row.id} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Name (e.g. Size)"
                          value={row.key}
                          onChange={(e) =>
                            updateAttributeRow(row.id, "key", e.target.value)
                          }
                          className="flex-1 w-full px-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Medium)"
                          value={row.value}
                          onChange={(e) =>
                            updateAttributeRow(row.id, "value", e.target.value)
                          }
                          className="flex-1 w-full px-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttribute(row.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                          title="Remove"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ))}
                    {attributeRows.length === 0 && (
                      <div className="text-xs text-[var(--color-text-muted)] italic text-center py-2 border border-dashed border-[var(--color-border)] rounded">
                        No custom attributes passed. Click to add.
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-[var(--color-text-primary)]">
                    Images
                  </label>

                  {/* Image Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                    {/* Existing Images */}
                    {existingImages.map((img, index) => (
                      <div
                        key={`existing-${index}`}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]"
                      >
                        <img
                          src={img}
                          alt={`Existing ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages(
                              existingImages.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Image"
                        >
                          <svg
                            className="w-3 h-3"
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
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
                          Existing
                        </div>
                      </div>
                    ))}

                    {/* New Images */}
                    {selectedImages.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-blue-500/50"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedImages(
                              selectedImages.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Image"
                        >
                          <svg
                            className="w-3 h-3"
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
                        <div className="absolute bottom-0 inset-x-0 bg-blue-500/80 text-white text-[10px] py-0.5 text-center">
                          New
                        </div>
                      </div>
                    ))}

                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 cursor-pointer transition-colors">
                      <svg
                        className="w-6 h-6 text-[var(--color-text-muted)] mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Add Image
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedImages((prev) => [
                              ...prev,
                              ...Array.from(e.target.files || []),
                            ]);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {existingImages.length} existing, {selectedImages.length}{" "}
                    new.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" fullWidth>
                    Save Product
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsPage;
