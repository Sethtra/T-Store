import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useAdminCategories,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/useCategories";
import type { Category } from "../../hooks/useProducts";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const CategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useAdminCategories();
  const { data: allCategories } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formData, setFormData] = useState({
    name: "",
    parent_id: "" as string | number, // Empty string for "No Parent"
  });
  const [searchQuery, setSearchQuery] = useState("");

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", parent_id: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parent_id: category.parent_id || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        name: formData.name,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: dataToSend,
        });
      } else {
        await createCategory.mutateAsync(dataToSend);
      }

      setIsModalOpen(false);
      setFormData({ name: "", parent_id: "" });
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to save category. Please try again.",
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Subcategories will be deleted too.",
      )
    )
      return;

    try {
      await deleteCategory.mutateAsync(id);
    } catch (error) {
      alert("Failed to delete category. Please try again.");
    }
  };

  // Helper to flatten categories for display
  const flattenCategories = (
    cats: Category[] | undefined,
    level = 0,
  ): Array<Category & { level: number }> => {
    if (!cats) return [];
    let flat: Array<Category & { level: number }> = [];

    cats.forEach((cat) => {
      flat.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flat = [...flat, ...flattenCategories(cat.children, level + 1)];
      }
    });

    return flat;
  };

  const flatCategories = flattenCategories(categories);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return flatCategories;
    const query = searchQuery.toLowerCase();
    return flatCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query),
    );
  }, [flatCategories, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-[var(--color-text-muted)]">
              Manage your product categories
            </p>
          </div>
        </div>

        {/* Categories Table */}
        <Card className="overflow-hidden">
          {/* Table Header with Search */}
          <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              All Categories
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
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <Button onClick={openCreateModal} className="flex-shrink-0">
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
                Add Category
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-muted)]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-muted)]">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-muted)]">
                    Products
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-[var(--color-bg-elevated)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {category.level > 0 && (
                          <div
                            style={{ width: `${category.level * 24}px` }}
                            className="flex-shrink-0 flex justify-end pr-2"
                          >
                            <span className="text-[var(--color-text-muted)]">
                              └
                            </span>
                          </div>
                        )}
                        <span
                          className={`font-medium ${category.level === 0 ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
                        >
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 rounded bg-[var(--color-bg-surface)] text-xs font-mono text-[var(--color-text-secondary)]">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" size="sm">
                        {category.products_count || 0} items
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
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
                          onClick={() => handleDelete(category.id)}
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
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                    >
                      {searchQuery ? (
                        <>
                          No categories match your search.
                          <button
                            onClick={() => setSearchQuery("")}
                            className="ml-2 text-[var(--color-primary)] hover:underline"
                          >
                            Clear search
                          </button>
                        </>
                      ) : (
                        'No categories found. Click "Add Category" to create one.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--color-bg-elevated)] rounded-lg p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Electronics"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  >
                    <option value="">None (Top Level)</option>
                    {allCategories
                      ?.filter((c) => c.id !== editingCategory?.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Select a parent to make this a subcategory.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="submit"
                    disabled={
                      createCategory.isPending || updateCategory.isPending
                    }
                    className="flex-1"
                  >
                    {createCategory.isPending || updateCategory.isPending
                      ? "Saving..."
                      : editingCategory
                        ? "Update"
                        : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;
