export type TPeriodSelectRowProps = {
  label: string;
  dotColor: string;
  value: number;
  onChange: (year: number) => void;
  onApply?: (year: number) => void;
  showApplyButton?: boolean;
};
