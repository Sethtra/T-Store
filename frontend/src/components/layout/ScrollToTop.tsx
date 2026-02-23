import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll window for customer pages
    window.scrollTo({
      top: 0,
      left: 0,
    });

    // Scroll admin layout wrapper for admin pages
    const adminContent = document.getElementById("admin-main-content");
    if (adminContent) {
      adminContent.scrollTo({
        top: 0,
        left: 0,
      });
    }
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
