import { useEffect } from "react";
import { useSiteSettings } from "../../hooks/useSiteSettings";

/**
 * Dynamically updates the browser tab favicon and page title
 * based on site settings from the API.
 * Mount this once at the app root level.
 */
const DynamicHead = () => {
  const { data: settings } = useSiteSettings();
  const faviconUrl = settings?.site_favicon_url;
  const siteName = settings?.site_name;

  // Update favicon
  useEffect(() => {
    // Find or create the favicon link tag
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    if (faviconUrl) {
      link.type = "image/png"; // or infer from url
      link.href = faviconUrl;
    } else {
      // Revert to default if removed
      link.type = "image/svg+xml";
      link.href = "/vite.svg";
    }
  }, [faviconUrl]);

  // Update page title with site name
  useEffect(() => {
    if (!siteName) return;

    const currentTitle = document.title;
    // Replace "T-Store" in the title with the actual site name
    if (currentTitle.includes("T-Store")) {
      document.title = currentTitle.replace("T-Store", siteName);
    }
  }, [siteName]);

  return null; // This component renders nothing
};

export default DynamicHead;
