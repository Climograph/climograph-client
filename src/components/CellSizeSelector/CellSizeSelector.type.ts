import type { TCellSize } from "@/types/domain/climate";
import type { TCellSizeOption } from "@/types/ui/cell-size";

export type TCellSizeSelectorProps = {
  activeSize: TCellSize;
  options: readonly TCellSizeOption[];
  onSelect: (size: TCellSize) => void;
};
