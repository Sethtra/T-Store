import { useSiteSettings } from "../../hooks/useSiteSettings";

interface SiteLogoProps {
  /** Size of the logo container */
  size?: "sm" | "md" | "lg";
  /** Whether to show the site name next to the logo */
  showName?: boolean;
  /** Additional className for the name text */
  nameClassName?: string;
}

const sizeMap = {
  sm: { box: "w-10 h-10 shrink-0", text: "text-xl", img: "h-10 w-auto max-w-[140px]", name: "text-lg" },
  md: { box: "w-12 h-12 md:w-14 md:h-14 shrink-0", text: "text-2xl", img: "h-12 md:h-16 w-auto max-w-[240px]", name: "text-xl md:text-2xl" },
  lg: { box: "w-20 h-20 shrink-0", text: "text-3xl", img: "h-20 md:h-24 w-auto max-w-[320px]", name: "text-2xl md:text-3xl" },
};

/**
 * Shared logo component used across Navbar, Footer, and Admin layout.
 * Displays the uploaded logo image or falls back to the gradient "T" box.
 */
const SiteLogo = ({ size = "md", showName = true, nameClassName }: SiteLogoProps) => {
  const { data: settings } = useSiteSettings();
  const s = sizeMap[size];
  const siteName = settings?.site_name || "T-Store";
  const logoUrl = settings?.site_logo_url;

  return (
    <div className="flex items-center gap-3">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={siteName}
          className={`${s.img} object-contain rounded-xl`}
        />
      ) : (
        <div
          className={`${s.box} flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-xl shadow-lg shadow-[var(--color-primary)]/20`}
        >
          <span className={`text-white font-bold ${s.text}`}>
            {siteName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {showName && (
        <span
          className={`font-bold tracking-tight ${s.name} ${
            nameClassName ||
            "bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text text-transparent"
          }`}
        >
          {siteName}
        </span>
      )}
    </div>
  );
};

export default SiteLogo;
