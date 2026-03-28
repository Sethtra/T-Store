import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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

  const selectedCategory = useMemo(() => {
    return categories?.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

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
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    } catch (error) {
      alert("Failed to delete category. Please try again.");
    }
  };

  // Filter ONLY main categories (which is what useAdminCategories returns by default at top level)
  const filteredParents = useMemo(() => {
    const parentCats = categories || [];
    if (!searchQuery) return parentCats;
    const query = searchQuery.toLowerCase();
    return parentCats.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full px-4 lg:px-8 py-4 lg:py-6 flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Categories
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Manage your product categories and subcategories
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
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
              placeholder="Search main categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
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
            Add Main Category
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Categories Table (Left Side) */}
          <div className="xl:col-span-2">
            <Card className="overflow-hidden border border-[var(--color-border)] shadow-sm">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Main Categories
                </h2>
              </div>
              <div className="overflow-x-auto bg-[var(--color-bg-elevated)]">
                <table className="w-full">
                  <thead className="bg-[var(--color-bg-surface)]">
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                        Slug
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-left text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                        Subcategories
                      </th>
                      <th className="px-3 md:px-5 py-3 md:py-4 text-right text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredParents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-[var(--color-text-muted)]"
                        >
                          {searchQuery
                            ? "No matching categories found."
                            : 'No categories found. Click "Add Main Category" to create one.'}
                        </td>
                      </tr>
                    ) : (
                      filteredParents.map((category) => (
                        <motion.tr
                          key={category.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setSelectedCategoryId(category.id)}
                          className={`hover:bg-[var(--color-bg-surface)]/50 transition-colors cursor-pointer ${
                            selectedCategoryId === category.id
                              ? "bg-[var(--color-bg-surface)]"
                              : ""
                          }`}
                        >
                          <td className="px-3 md:px-5 py-3 md:py-4">
                            <span className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                              <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                                {category.name.substring(0, 2)}
                              </span>
                              <span className="truncate">{category.name}</span>
                            </span>
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 hidden md:table-cell">
                            <code className="px-2 py-1 rounded bg-[var(--color-bg-surface)] text-xs font-mono text-[var(--color-text-secondary)]">
                              {category.slug}
                            </code>
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4">
                            <Badge variant="default" size="sm">
                              {category.products_count || 0}
                            </Badge>
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 hidden sm:table-cell">
                            <span className="text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] px-2.5 py-1 rounded-full border border-[var(--color-border)]">
                              {category.children?.length || 0}
                            </span>
                          </td>
                          <td className="px-3 md:px-5 py-3 md:py-4 text-right hidden sm:table-cell">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEditModal(category)}
                                className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Category Detail Panel (Right Side) - Bottom sheet on mobile */}
          <AnimatePresence mode="wait">
            {selectedCategoryId && selectedCategory && (
              <motion.div
                key={selectedCategoryId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 xl:relative xl:inset-auto xl:z-auto xl:col-span-1 bg-black/50 xl:bg-transparent flex items-end xl:items-stretch"
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedCategoryId(null); }}
              >
                <div className="w-full xl:w-auto max-h-[85vh] xl:max-h-none overflow-y-auto rounded-t-2xl xl:rounded-xl">
                  <Card className="border border-[var(--color-border)] shadow-sm xl:sticky xl:top-28 rounded-t-2xl xl:rounded-xl">
                    <Card.Body className="p-6">
                      <div className="space-y-6">
                        {/* Close button for mobile */}
                        <div className="flex items-center justify-between xl:hidden">
                          <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase">Category Details</h3>
                          <button
                            onClick={() => setSelectedCategoryId(null)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Detail Header */}
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 ring-4 ring-[var(--color-border)] shadow-lg shadow-[var(--color-primary)]/20">
                            {selectedCategory.name.substring(0, 2).toUpperCase()}
                          </div>
                          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                            {selectedCategory.name}
                          </h3>
                          <p className="text-sm font-mono text-[var(--color-text-muted)] mt-1">
                            /{selectedCategory.slug}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)]">
                            <div className="text-xl font-bold text-[var(--color-text-primary)]">
                              {selectedCategory.products_count || 0}
                            </div>
                            <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold mt-1">
                              Products
                            </div>
                          </div>
                          <div className="text-center p-3 bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)]">
                            <div className="text-xl font-bold text-[var(--color-text-primary)]">
                              {selectedCategory.children?.length || 0}
                            </div>
                            <div className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold mt-1">
                              Subcategories
                            </div>
                          </div>
                        </div>

                        {/* Subcategories List */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                              Subcategories
                            </h4>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setFormData({ name: "", parent_id: selectedCategory.id });
                                setIsModalOpen(true);
                              }}
                              className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                              </svg>
                              Add New
                            </button>
                          </div>
                          
                          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {selectedCategory.children && selectedCategory.children.length > 0 ? (
                              selectedCategory.children.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between p-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg transition-colors hover:border-[var(--color-primary)]/50 group"
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                      {sub.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate mt-0.5">
                                      /{sub.slug}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openEditModal(sub)}
                                      className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded"
                                      title="Edit Subcategory"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(sub.id)}
                                      className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded"
                                      title="Delete Subcategory"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 border border-dashed border-[var(--color-border)] rounded-lg">
                                <p className="text-xs text-[var(--color-text-muted)]">No subcategories yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[var(--color-bg-elevated)] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[var(--color-border)]"
            >
              <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-primary)]">Name</label>
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
                  <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-primary)]">
                    Parent Category
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all text-sm text-[var(--color-text-primary)]"
                  >
                    <option value="">None (Make it a Top Level Category)</option>
                    {allCategories
                      ?.filter((c) => c.id !== editingCategory?.id) // Prevent setting itself as parent
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    Select a parent to nest this category under it.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      createCategory.isPending || updateCategory.isPending
                    }
                    className="flex-1 py-2.5 rounded-xl font-medium shadow-sm"
                  >
                    {createCategory.isPending || updateCategory.isPending
                      ? "Saving..."
                      : editingCategory
                        ? "Save Changes"
                        : "Create Category"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl font-medium"
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

