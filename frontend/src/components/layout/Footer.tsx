import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products?sort=newest" },
      { label: "Best Sellers", href: "/products?sort=popular" },
    ],
    support: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl">T-Store</span>
            </Link>
            <p className="text-[var(--color-text-muted)] text-sm">
              Premium products. Exceptional experience. Free shipping on orders
              over $50.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-text-muted)] text-sm">
            © {currentYear} T-Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment Methods */}
            <span className="text-[var(--color-text-muted)] text-sm">
              We accept:
            </span>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-[var(--color-bg-surface)] rounded text-xs font-medium text-[var(--color-text-secondary)]">
                Visa
              </div>
              <div className="px-2 py-1 bg-[var(--color-bg-surface)] rounded text-xs font-medium text-[var(--color-text-secondary)]">
                Mastercard
              </div>
              <div className="px-2 py-1 bg-[var(--color-bg-surface)] rounded text-xs font-medium text-[var(--color-text-secondary)]">
                PayPal
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
