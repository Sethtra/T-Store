import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  useAdminCategoryDisplays,
  useUpdateCategoryDisplay,
  useUploadCategoryDisplayImage,
  useDeleteCategoryDisplayImage,
  type CategoryDisplay,
} from "../../hooks/useCategoryDisplays";
import { useAdminCategories } from "../../hooks/useCategories";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const CategoryDisplayPage = () => {
  const { data: displays, isLoading } = useAdminCategoryDisplays();
  const { data: categories } = useAdminCategories();
  const updateDisplay = useUpdateCategoryDisplay();
  const uploadImage = useUploadCategoryDisplayImage();
  const deleteImage = useDeleteCategoryDisplayImage();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CategoryDisplay>>({});
  const [dragOver, setDragOver] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const positionLabels: Record<string, string> = {
    main: "Main Card (Large Left)",
    featured: "Featured Card (Top Right)",
    small_1: "Small Card 1 (Bottom Left)",
    small_2: "Small Card 2 (Bottom Right)",
  };

  const handleEdit = (display: CategoryDisplay) => {
    setEditingId(display.id);
    setFormData({
      title: display.title,
      description: display.description || "",
      button_text: display.button_text,
      link: display.link || "",
      category_id: display.category_id,
      is_active: display.is_active,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    await updateDisplay.mutateAsync({ id: editingId, data: formData });
    setEditingId(null);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleImageUpload = async (id: number, file: File) => {
    await uploadImage.mutateAsync({ id, file });
  };

  const handleImageDelete = async (id: number) => {
    await deleteImage.mutateAsync(id);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, displayId: number) => {
      e.preventDefault();
      setDragOver(null);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        await handleImageUpload(displayId, file);
      }
    },
    [],
  );

  const handleDragOver = (e: React.DragEvent, displayId: number) => {
    e.preventDefault();
    setDragOver(displayId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-64 skeleton rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Category Display Manager
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Customize the "Browse by Categories" section on your homepage
          </p>
        </div>
        <Link to="/" target="_blank">
          <Button variant="outline" size="sm">
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Live Preview */}
        <Card className="mb-8 overflow-hidden">
          <Card.Header className="bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[var(--color-primary)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
              <h2 className="font-semibold">Layout Preview</h2>
            </div>
          </Card.Header>
          <Card.Body className="p-6 bg-gray-100 dark:bg-gray-900">
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[300px]">
              {displays?.map((display) => {
                const isMain = display.position === "main";
                const isFeatured = display.position === "featured";
                return (
                  <motion.div
                    key={display.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative rounded-xl overflow-hidden cursor-pointer group
                      ${isMain ? "col-span-2 row-span-2" : ""}
                      ${isFeatured ? "col-span-2" : ""}
                      ${!display.is_active ? "opacity-50 grayscale" : ""}
                    `}
                    onClick={() => handleEdit(display)}
                  >
                    {/* Background */}
                    <div className="absolute inset-0 bg-[#f5f5f5] dark:bg-gray-800" />

                    {/* Image */}
                    {display.image_url && (
                      <img
                        src={display.image_url}
                        alt={display.title}
                        className="absolute inset-0 w-full h-full object-contain p-4"
                      />
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
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
                        <span className="text-sm font-medium">Edit</span>
                      </div>
                    </div>

                    {/* Position Label */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                      {positionLabels[display.position]}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card.Body>
        </Card>

        {/* Edit Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displays?.map((display) => (
            <motion.div
              key={display.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`overflow-hidden transition-all ${
                  editingId === display.id
                    ? "ring-2 ring-[var(--color-primary)]"
                    : ""
                }`}
              >
                <Card.Header className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        display.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <div>
                      <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {positionLabels[display.position]}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {display.title}
                      </p>
                    </div>
                  </div>
                  {editingId !== display.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(display)}
                    >
                      Edit
                    </Button>
                  )}
                </Card.Header>

                <Card.Body className="space-y-4">
                  {/* Image Upload */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl transition-colors ${
                      dragOver === display.id
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)]"
                    }`}
                    onDrop={(e) => handleDrop(e, display.id)}
                    onDragOver={(e) => handleDragOver(e, display.id)}
                    onDragLeave={handleDragLeave}
                  >
                    {display.image_url ? (
                      <div className="relative aspect-video">
                        <img
                          src={display.image_url}
                          alt={display.title}
                          className="w-full h-full object-contain rounded-lg bg-gray-100 dark:bg-gray-800 p-4"
                        />
                        <button
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          onClick={() => handleImageDelete(display.id)}
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
                    ) : (
                      <div
                        className="aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg-elevated)] transition-colors rounded-lg"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setEditingId(display.id);
                        }}
                      >
                        <svg
                          className="w-10 h-10 text-[var(--color-text-muted)] mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-[var(--color-text-muted)]">
                          Drop image here or click to upload
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && editingId) {
                          handleImageUpload(editingId, file);
                        }
                      }}
                    />
                  </div>

                  {/* Edit Form */}
                  <AnimatePresence>
                    {editingId === display.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <Input
                          label="Title"
                          value={formData.title || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                        />

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                            Description
                          </label>
                          <textarea
                            value={formData.description || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Button Text"
                            value={formData.button_text || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                button_text: e.target.value,
                              })
                            }
                          />
                          <Input
                            label="Link URL"
                            value={formData.link || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, link: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                            Linked Category (Optional)
                          </label>
                          <select
                            value={formData.category_id || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category_id: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                          >
                            <option value="">None</option>
                            {categories?.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active ?? true}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  is_active: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                          </label>
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            Active
                          </span>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button variant="ghost" onClick={handleCancel}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={updateDisplay.isPending}
                          >
                            {updateDisplay.isPending
                              ? "Saving..."
                              : "Save Changes"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryDisplayPage;
