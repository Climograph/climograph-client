export default function FilterChip({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium bg-[var(--color-primary-subtle)] text-[var(--color-primary)] px-2.5 py-1 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}
