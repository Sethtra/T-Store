import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";
import SiteLogo from "../ui/SiteLogo";

const GITHUB_REPO_URL = "https://github.com/Sethtra/T-Store";

const Footer = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.shop"),
      links: [
        { label: t("footer.all_products"), to: "/products" },
        { label: t("footer.new_arrivals"), to: "/products?sort=newest" },
        { label: t("footer.best_sellers"), to: "/products?sort=popular" },
      ],
    },
    {
      title: t("footer.account"),
      links: isAuthenticated
        ? [{ label: t("footer.my_orders"), to: "/orders" }]
        : [
            { label: t("footer.sign_in"), to: "/login" },
            { label: t("footer.create_account"), to: "/register" },
          ],
    },
    {
      title: t("footer.company"),
      links: [{ label: t("footer.about"), to: "/about" }],
    },
  ];

  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid gap-10 py-14 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <Link to="/" className="inline-flex rounded-[var(--radius-sm)]" aria-label="T-Store home">
              <SiteLogo size="sm" showName />
            </Link>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
              {t("footer.brand_desc")}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 max-w-sm text-sm">
              <div>
                <dt className="text-[var(--color-text-muted)]">{t("footer.payments")}</dt>
                <dd className="mt-1 font-medium">{t("footer.pay_khqr")}</dd>
                <dd className="text-[var(--color-text-secondary)]">{t("footer.pay_card")}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">{t("footer.delivery")}</dt>
                <dd className="mt-1 font-medium">{t("footer.deliver_pp")}</dd>
              </div>
            </dl>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 lg:col-span-6 lg:col-start-7"
          >
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{col.title}</h2>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-[0.9375rem] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-[var(--color-border)] py-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright", { year: currentYear })}</p>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-[var(--color-text-primary)]"
          >
            <Github className="w-4 h-4" aria-hidden="true" />
            {t("footer.source")}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
