export function HeatMap() {
  return (
    <section className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-[960px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center">
        <h1 className="text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
          Heat Map
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          Heat map page placeholder. We can later render climate intensity on a world map here.
        </p>
      </div>
    </section>
  );
}
