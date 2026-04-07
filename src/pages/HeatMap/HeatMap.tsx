import { useTranslation } from "react-i18next";

export function HeatMap() {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-[960px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center">
        <h1 className="text-[length:var(--font-xl)] lg:text-[length:var(--font-2xl)] font-bold text-[var(--color-primary)]">
          {t("heatMap.title")}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{t("heatMap.placeholder")}</p>
      </div>
    </section>
  );
}
