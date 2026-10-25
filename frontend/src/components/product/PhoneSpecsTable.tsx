import type { PhoneSpecs } from "../../types/product";
import { PHONE_SPEC_GROUPS, specGroupValue } from "../../utils/phoneSpecs";

interface PhoneSpecsTableProps {
  specs: PhoneSpecs;
  isKh: boolean;
}

/** Grouped phone specifications in two columns; empty groups are left out. */
const PhoneSpecsTable = ({ specs, isKh }: PhoneSpecsTableProps) => {
  const rows = PHONE_SPEC_GROUPS.map((group) => ({ group, value: specGroupValue(specs, group.key) })).filter((r) => r.value);
  if (!rows.length) return null;

  return (
    <dl className="grid md:grid-cols-2 md:gap-x-12">
      {rows.map(({ group, value }) => (
        <div
          key={group.key}
          className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-4 border-b border-[var(--color-border)] py-3.5"
        >
          <dt className="text-sm text-[var(--color-text-muted)]">{isKh ? group.label_kh : group.label}</dt>
          {/* Your text only; short facts are used just when a row has no text */}
          <dd className="min-w-0 whitespace-pre-line text-[0.9375rem] leading-relaxed">{value!.text ?? value!.facts.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
};

export default PhoneSpecsTable;
