import { TCellSizeSelectorProps } from "./CellSizeSelector.type";
import { getButtonClasses } from "./CellSizeSelector.util";

export function CellSizeSelector({ activeSize, options, onSelect }: TCellSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 md:gap-4 flex-wrap`}>
      <span
        className={`
          text-[length:var(--font-md)] text-[var(--color-text-strong)] 
          whitespace-nowrap
        `}
      >
        Cell resolution:
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
