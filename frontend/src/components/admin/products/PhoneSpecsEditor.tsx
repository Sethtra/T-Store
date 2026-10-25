import type { PhoneSpecs } from "../../../types/product";
import { OS_OPTIONS, PHONE_SPEC_GROUPS, hasSpecs, type SpecField, type SpecGroupKey } from "../../../utils/phoneSpecs";

interface PhoneSpecsEditorProps {
  value: PhoneSpecs;
  onChange: (next: PhoneSpecs) => void;
}

const inputClass =
  "w-full px-3 py-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]";

/**
 * The 12 phone spec groups. Free text for the description, typed boxes for
 * the numbers used on product cards and (later) filters. Leave a group empty to hide it.
 */
const PhoneSpecsEditor = ({ value, onChange }: PhoneSpecsEditorProps) => {
  const setField = (group: SpecGroupKey, field: string, fieldValue: unknown) => {
    const current = { ...((value[group] ?? {}) as Record<string, unknown>) };
    if (fieldValue === "" || fieldValue === undefined || fieldValue === false) delete current[field];
    else current[field] = fieldValue;

    const next = { ...value } as Record<string, unknown>;
    if (Object.keys(current).length) next[group] = current;
    else delete next[group];
    onChange(next as PhoneSpecs);
  };

  const renderField = (group: SpecGroupKey, field: SpecField) => {
    const current = (value[group] as Record<string, unknown> | undefined)?.[field.key];
    const id = `spec-${group}-${field.key}`;

    if (field.type === "bool") {
      return (
        <label key={field.key} htmlFor={id} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
          <input id={id} type="checkbox" checked={current === true} onChange={(e) => setField(group, field.key, e.target.checked)} />
          {field.label}
        </label>
      );
    }

    if (field.type === "os") {
      return (
        <select
          key={field.key}
          id={id}
          aria-label="Operating system"
          value={typeof current === "string" ? current : ""}
          onChange={(e) => setField(group, field.key, e.target.value)}
          className={`${inputClass} sm:w-36 sm:shrink-0`}
        >
          <option value="">OS…</option>
          {OS_OPTIONS.map((os) => (
            <option key={os} value={os}>
              {os}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "number") {
      return (
        <div key={field.key} className="relative sm:w-32 sm:shrink-0">
          <input
            id={id}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            aria-label={`${field.label} (${field.unit})`}
            placeholder={field.placeholder}
            value={typeof current === "number" ? current : ""}
            onChange={(e) => setField(group, field.key, e.target.value === "" ? "" : Number(e.target.value))}
            className={`${inputClass} pr-11`}
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
            {field.unit}
          </span>
        </div>
      );
    }

    return (
      <input
        key={field.key}
        id={id}
        type="text"
        maxLength={1000}
        placeholder={field.placeholder}
        value={typeof current === "string" ? current : ""}
        onChange={(e) => setField(group, field.key, e.target.value)}
        className={`${inputClass} min-w-0 flex-1`}
      />
    );
  };

  return (
    <details className="group rounded-lg border border-[var(--color-border)]" open={hasSpecs(value)}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]">
        <span>
          Phone specifications
          <span className="ml-2 font-normal text-[var(--color-text-muted)]">Number boxes feed the key-specs strip and cards only. Leave a row empty to hide it</span>
        </span>
        <span aria-hidden="true" className="text-[var(--color-text-muted)] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-3 border-t border-[var(--color-border)] px-4 py-4">
        {PHONE_SPEC_GROUPS.map((group) => (
          <div key={group.key} className="grid gap-1.5 sm:grid-cols-[8.5rem_1fr] sm:items-start sm:gap-3">
            <label htmlFor={`spec-${group.key}-text`} className="pt-1.5 text-sm font-medium text-[var(--color-text-primary)]">
              {group.label}
            </label>
            <div className={`flex flex-col gap-2 sm:flex-row ${group.key === "connectivity" ? "sm:flex-wrap sm:items-center sm:gap-x-4" : ""}`}>
              {group.fields.map((field) => renderField(group.key, field))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
};

export default PhoneSpecsEditor;
