import { useState, useRef } from "react";
import {
  useSiteSettings,
  useUploadLogo,
  useDeleteLogo,
  useUpdateSiteName,
  useUploadFavicon,
  useDeleteFavicon,
} from "../../hooks/useSiteSettings";
import AdminLayout from "../../components/admin/AdminLayout";

const SettingsPage = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();
  const updateName = useUpdateSiteName();
  const uploadFavicon = useUploadFavicon();
  const deleteFavicon = useDeleteFavicon();

  const [siteName, setSiteName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sync site name when data loads
  const currentName = settings?.site_name || "T-Store";
  if (!nameEditing && siteName === "" && currentName) {
    setSiteName(currentName);
  }

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 2 * 1024 * 1024) {
      showToast("File must be under 2MB", "error");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    try {
      await uploadLogo.mutateAsync(file);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      showToast("Logo updated successfully!");
    } catch {
      showToast("Failed to upload logo", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove the current logo? The default text logo will be used.")) return;
    try {
      await deleteLogo.mutateAsync();
      setPreview(null);
      showToast("Logo removed.");
    } catch {
      showToast("Failed to remove logo", "error");
    }
  };

  const handleFaviconFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 512 * 1024) {
      showToast("Favicon must be under 512KB", "error");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setFaviconPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = async () => {
    const file = faviconFileRef.current?.files?.[0];
    if (!file) return;

    try {
      await uploadFavicon.mutateAsync(file);
      setFaviconPreview(null);
      if (faviconFileRef.current) faviconFileRef.current.value = "";
      showToast("Favicon updated successfully!");
    } catch {
      showToast("Failed to upload favicon", "error");
    }
  };

  const handleFaviconDelete = async () => {
    if (!confirm("Remove the current favicon? The default will be used.")) return;
    try {
      await deleteFavicon.mutateAsync();
      setFaviconPreview(null);
      showToast("Favicon removed.");
    } catch {
      showToast("Failed to remove favicon", "error");
    }
  };

  const handleNameSave = async () => {
    if (!siteName.trim()) return;
    try {
      await updateName.mutateAsync(siteName.trim());
      setNameEditing(false);
      showToast("Site name updated!");
    } catch {
      showToast("Failed to update name", "error");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-[var(--color-bg-surface)] rounded-lg" />
            <div className="h-64 bg-[var(--color-bg-surface)] rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all animate-in slide-in-from-right ${
            toast.type === "success"
              ? "bg-[var(--color-success)] text-white"
              : "bg-[var(--color-error)] text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Site Settings
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Manage your store branding — logo and site name.
        </p>
      </div>

      {/* Logo Section */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Store Logo
        </h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Current Logo Preview */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Current
            </p>
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center overflow-hidden">
              {settings?.site_logo_url ? (
                <img
                  src={settings.site_logo_url}
                  alt="Current logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">
                    {currentName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {settings?.site_logo_url && (
              <button
                onClick={handleDelete}
                disabled={deleteLogo.isPending}
                className="text-xs text-[var(--color-error)] hover:text-[var(--color-error)]/80 font-medium transition-colors disabled:opacity-50"
              >
                {deleteLogo.isPending ? "Removing..." : "Remove Logo"}
              </button>
            )}
          </div>

          {/* Upload Area */}
          <div className="flex-1 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Upload New
            </p>
            <label className="w-full h-32 rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-surface)] flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <>
                  <svg className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                    Click to choose file
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] mt-1">
                    PNG, JPG, SVG, WebP — max 2MB
                  </span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>

            {preview && (
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploadLogo.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                >
                  {uploadLogo.isPending ? "Uploading..." : "Save Logo"}
                </button>
                <button
                  onClick={() => {
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favicon Section */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Site Favicon
        </h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Current Favicon Preview */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Current
            </p>
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center overflow-hidden">
              {settings?.site_favicon_url ? (
                <img
                  src={settings.site_favicon_url}
                  alt="Current favicon"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <img src="/vite.svg" alt="Default favicon" className="w-8 h-8 object-contain" />
              )}
            </div>
            {settings?.site_favicon_url && (
              <button
                onClick={handleFaviconDelete}
                disabled={deleteFavicon.isPending}
                className="text-xs text-[var(--color-error)] hover:text-[var(--color-error)]/80 font-medium transition-colors disabled:opacity-50"
              >
                {deleteFavicon.isPending ? "Removing..." : "Remove Favicon"}
              </button>
            )}
          </div>

          {/* Upload Area */}
          <div className="flex-1 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              Upload New
            </p>
            <label className="w-full h-40 rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-surface)] flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden">
              {faviconPreview ? (
                <img
                  src={faviconPreview}
                  alt="Preview"
                  className="w-32 h-32 object-contain p-2"
                />
              ) : (
                <>
                  <svg className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                    Click to choose file
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] mt-1">
                    PNG, ICO, SVG, WebP — max 512KB (1:1 ratio)
                  </span>
                </>
              )}
              <input
                ref={faviconFileRef}
                type="file"
                accept=".ico,image/png,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleFaviconFileSelect}
              />
            </label>

            {faviconPreview && (
              <div className="flex gap-3">
                <button
                  onClick={handleFaviconUpload}
                  disabled={uploadFavicon.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                >
                  {uploadFavicon.isPending ? "Uploading..." : "Save Favicon"}
                </button>
                <button
                  onClick={() => {
                    setFaviconPreview(null);
                    if (faviconFileRef.current) faviconFileRef.current.value = "";
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Site Name Section */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Site Name
        </h2>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => {
                setSiteName(e.target.value);
                setNameEditing(true);
              }}
              maxLength={50}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-all"
              placeholder="Your store name..."
            />
          </div>
          <button
            onClick={handleNameSave}
            disabled={!nameEditing || updateName.isPending || !siteName.trim()}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {updateName.isPending ? "Saving..." : "Save"}
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-2">
          This name appears in the navbar, footer, and admin sidebar.
        </p>
      </div>
    </div>
    </AdminLayout>
  );
};

export default SettingsPage;
