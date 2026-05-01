import { CLIMATE_RANGE } from "@/constants";
import { useState } from "react";
import type { TPeriodSelectRowProps } from "./PeriodSelectRow.type";

export function PeriodSelectRow({
  label,
  dotColor,
  value,
  onChange,
  onApply,
  showApplyButton = false,
}: TPeriodSelectRowProps) {
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(String(value));
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsDirty(true);

    if (val === "") {
      setError(null);
      return;
    }

    const n = parseInt(val, 10);

    if (isNaN(n)) {
      setError("Enter a valid number");
      return;
    }

    if (n < CLIMATE_RANGE.MIN_START) {
      setError(`Year must be at least ${CLIMATE_RANGE.MIN_START}`);
      return;
    }

    if (n > CLIMATE_RANGE.MAX_START) {
      setError(`Year cannot exceed ${CLIMATE_RANGE.MAX_START}`);
      return;
    }

    setError(null);

    if (!showApplyButton) {
      onChange(n);
    }
  };

  const handleBlur = () => {
    if (inputValue === "") {
      setInputValue(String(value));
      setError(null);
      setIsDirty(false);
    } else {
      const n = parseInt(inputValue, 10);
      if (!isNaN(n) && n >= CLIMATE_RANGE.MIN_START && n <= CLIMATE_RANGE.MAX_START) {
        if (!isDirty) {
          setInputValue(String(value));
        }
      }
    }
  };

  const handleApply = () => {
    const n = parseInt(inputValue, 10);
    if (!isNaN(n) && n >= CLIMATE_RANGE.MIN_START && n <= CLIMATE_RANGE.MAX_START && !error) {
      (onApply || onChange)(n);
      setIsDirty(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
        <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className={`flex items-center ${showApplyButton ? "gap-2" : "gap-3"}`}>
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-24 rounded-[var(--radius-md)] border px-3 py-2 text-[length:var(--font-sm)] focus:outline-none focus:ring-2 transition-colors ${
              error
                ? "border-[var(--color-error)] bg-[var(--color-error-bg)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)] bg-[var(--color-bg)] focus:ring-[var(--color-primary)]"
            }`}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
          {!showApplyButton && (
            <span className="text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
              {value}–{value + CLIMATE_RANGE.WINDOW}
            </span>
          )}
          {showApplyButton && (
            <button
              type="button"
              onClick={handleApply}
              disabled={!!error || !isDirty}
              className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-[length:var(--font-sm)] font-medium transition-colors hover:bg-[var(--color-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          )}
        </div>
        {showApplyButton && (
          <span className="text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
            {value}–{value + CLIMATE_RANGE.WINDOW}
          </span>
        )}
        {error && (
          <span
            id={`${label}-error`}
            className="text-[length:var(--font-xs)] text-[var(--color-error)] font-medium"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
