import { TCellSizeSelectorProps } from "./CellSizeSelector.type";
import { useTranslation } from "react-i18next";
import { getButtonClasses } from "./CellSizeSelector.util";

export function CellSizeSelector({ activeSize, options, onSelect }: TCellSizeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-2 md:gap-4 flex-wrap`}>
      <span
        className={`
          text-[length:var(--font-md)] text-[var(--color-text-strong)] 
          whitespace-nowrap
        `}
      >
        {t("climateStatistics.cellResolution")}
      </span>

      <div className={`flex gap-3`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={getButtonClasses(activeSize, option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
