import type { TFilterChipProps } from "./FilterChip.type";

export default function FilterChip({ label, isActive = false, onClick }: TFilterChipProps) {
  if (onClick !== undefined) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]"
            : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-chip-active-border)] hover:text-[var(--color-chip-active-text)]"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-[var(--color-primary-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
      {label}
    </span>
  );
}
