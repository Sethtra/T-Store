import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  id: string;
  /** Lighter lead-in, e.g. "Grab the best deal on" */
  lead?: ReactNode;
  /** Emphasised part, e.g. the category name */
  highlight: ReactNode;
  viewAllTo?: string;
  /** Extra controls rendered before "View all" (e.g. scroll arrows) */
  actions?: ReactNode;
}

/**
 * Heading sits on a full-width hairline with a short ink bar under the
 * title itself; "View all ›" on the right.
 */
const SectionHeader = ({ id, lead, highlight, viewAllTo, actions }: SectionHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--color-border)] md:mb-6">
      <h2
        id={id}
        className="relative -mb-px border-b-[3px] border-[var(--color-text-primary)] pb-3 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-secondary)] sm:text-[1.375rem]"
      >
        {lead && <>{lead} </>}
        <span className="font-bold text-[var(--color-text-primary)]">{highlight}</span>
      </h2>
      <div className="flex shrink-0 items-center gap-2 pb-3">
        {actions}
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="inline-flex items-center gap-0.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            {t("home.view_all")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
