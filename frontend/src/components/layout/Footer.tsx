import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

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
    <footer className="relative bg-[var(--color-bg-secondary)] pt-20 pb-10 border-t border-[var(--color-border)] mt-24 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[var(--color-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20 transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[var(--color-text-primary)]">
                T-Store
              </span>
            </Link>
            <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-sm">
              Discover premium electronics and accessories designed for modern
              life. Quality products, exceptional service, and fast shipping
              worldwide.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {[
                {
                  icon: Twitter,
                  href: "https://twitter.com",
                  label: "Twitter",
                },
                {
                  icon: Facebook,
                  href: "https://facebook.com",
                  label: "Facebook",
                },
                {
                  icon: Instagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
                { icon: Github, href: "https://github.com", label: "Github" },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors group"
                >
                  <span className="sr-only">{social.label}</span>
                  <social.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Shop Links */}
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] mb-6 text-lg">
                Shop
              </h4>
              <ul className="space-y-4">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] mb-6 text-lg">
                Support
              </h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-bold text-[var(--color-text-primary)] mb-6 text-lg">
                Company
              </h4>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors inline-block hover:translate-x-1 duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Newsletter Teaser */}
              <div className="mt-8 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Join our newsletter
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-transparent border-b border-[var(--color-border)] text-sm py-1 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                  <button className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--color-text-muted)] text-sm">
            © {currentYear} T-Store. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
              {/* Simple Credit Card Icons placeholder */}
              {["Visa", "Mastercard", "Amex", "PayPal"].map((card) => (
                <div
                  key={card}
                  className="h-6 px-2 bg-white rounded border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-800"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
