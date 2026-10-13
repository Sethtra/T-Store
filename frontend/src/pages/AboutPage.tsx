import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Github } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/Sethtra/T-Store";

// Facts taken from the project README; keep in sync with what actually ships.
const BUILT = {
  en: [
    {
      title: "Storefront",
      items: [
        "Search, category and price filters, sorting",
        "Product galleries with variants",
        "Cloud-synced cart",
        "Checkout with ABA PayWay KHQR and Stripe cards",
        "Order history, invoices and payment retry",
        "English and Khmer, light and dark",
      ],
    },
    {
      title: "Admin",
      items: [
        "Products, categories and homepage sections",
        "Orders, inventory ledger and stock movements",
        "Users with roles and suspension",
        "Reports and CSV exports",
        "Site name, logo and hero copy",
      ],
    },
    {
      title: "Stack",
      items: ["React 19, TypeScript, Vite, Tailwind CSS", "Laravel 12 API with Sanctum", "Stripe and ABA PayWay webhooks"],
    },
  ],
  kh: [
    {
      title: "ហាង",
      items: [
        "ស្វែងរក តម្រងប្រភេទ និងតម្លៃ",
        "រូបភាពផលិតផល និងជម្រើស",
        "កន្ត្រកធ្វើសមកាលកម្មលើ Cloud",
        "ទូទាត់តាម ABA PayWay KHQR និងកាត Stripe",
        "ប្រវត្តិការបញ្ជាទិញ វិក្កយបត្រ និងការទូទាត់ឡើងវិញ",
        "ភាសាខ្មែរ និងអង់គ្លេស ពន្លឺ និងងងឹត",
      ],
    },
    {
      title: "ផ្ទាំងគ្រប់គ្រង",
      items: [
        "ផលិតផល ប្រភេទ និងផ្នែកទំព័រដើម",
        "ការបញ្ជាទិញ និងស្តុកទំនិញ",
        "អ្នកប្រើប្រាស់ តួនាទី និងការផ្អាក",
        "របាយការណ៍ និងការនាំចេញ CSV",
        "ឈ្មោះហាង ឡូហ្គោ និងអត្ថបទទំព័រដើម",
      ],
    },
    {
      title: "បច្ចេកវិទ្យា",
      items: ["React 19, TypeScript, Vite, Tailwind CSS", "Laravel 12 API ជាមួយ Sanctum", "Stripe និង ABA PayWay webhooks"],
    },
  ],
};

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isKh = i18n.language === "kh";
  const groups = isKh ? BUILT.kh : BUILT.en;

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 pt-10 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 rise-in">
          <h1 className="text-[clamp(2.25rem,4.4vw,3.75rem)] font-[680] leading-[1.05] tracking-[-0.035em]">
            {t("about.title_part1")}
            <br />
            {t("about.title_part2")}
          </h1>

          <div className="mt-8 max-w-[60ch] space-y-5 text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
          </div>

          <div className="mt-10 flex items-center gap-4 border-t border-[var(--color-border)] pt-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-bg-surface)] font-semibold" aria-hidden="true">
              ST
            </span>
            <div>
              <p className="font-semibold">Seth Tra</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{t("about.role")}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-semibold text-[var(--color-on-primary)]"
            >
              {t("home.shop_all")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-hover)] px-6 font-semibold hover:border-[var(--color-text-primary)]"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              {t("footer.source")}
            </a>
          </div>
        </div>

        <aside className="lg:col-span-5 lg:col-start-8" aria-label={isKh ? "អ្វីដែលបានសាងសង់" : "What's built"}>
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-semibold">{isKh ? "អ្វីដែលបានសាងសង់" : "What's built"}</h2>
            <div className="mt-6 space-y-7">
              {groups.map((g) => (
                <section key={g.title}>
                  <h3 className="text-sm font-semibold text-[var(--color-text-muted)]">{g.title}</h3>
                  <ul className="mt-2.5 space-y-2">
                    {g.items.map((item) => (
                      <li key={item} className="flex gap-3 text-[0.9375rem]">
                        <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-primary)]" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AboutPage;
