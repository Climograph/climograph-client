import { LANGUAGE_SWITCHER_VARIANTS, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NAV_LINKS } from "@/constants";
import { GLOBAL_CONFIG } from "@/global-config";
import { useTheme } from "@/hooks";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { FilterIcon, MoonIcon, SunIcon } from "../svg";
import type { TTopbarProps } from "./Topbar.type";

function ClimaticaLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 14C4.5 8 7.5 8 10 14S15.5 20 18 14 23.5 8 26 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BurgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <span
        className={`block h-[2px] w-5 origin-center rounded-full stroke-current transition-all duration-300 ${
          isOpen ? "translate-y-[7px] rotate-45" : ""
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
      <span
        className={`block h-[2px] w-5 rounded-full stroke-current transition-all duration-300 ${
          isOpen ? "scale-x-0 opacity-0" : ""
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
      <span
        className={`block h-[2px] w-5 origin-center rounded-full stroke-current transition-all duration-300 ${
          isOpen ? "-translate-y-[7px] -rotate-45" : ""
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
    </div>
  );
}

export function Topbar({ isSidebarOpen, onToggleSidebar }: TTopbarProps) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    queueMicrotask(() => setIsNavOpen(false));
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsNavOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isNavOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isNavOpen]);

  return (
    <header
      ref={headerRef}
      className="relative h-16 w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="flex h-full items-center px-4">
        {/* Logo */}
        <div className="flex flex-1 items-center gap-2.5 text-[var(--color-primary)]">
          <ClimaticaLogo />
          <span className="text-[length:var(--font-base)] font-semibold tracking-wide">
            {GLOBAL_CONFIG.appName}
          </span>
        </div>

        {/* Desktop center nav */}
        <nav className="hidden gap-0.5 lg:flex">
          {NAV_LINKS.map(({ to, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `rounded-[var(--radius-sm)] px-4 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--color-bg-secondary)] font-medium text-[var(--color-text)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
                }`
              }
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-end gap-1">
          {/* Desktop language switcher */}
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>

          {/* Theme toggle — always visible */}
          <button
            type="button"
            aria-label={t("topbar.toggleTheme")}
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Filter toggle — mobile/tablet only */}
          <button
            type="button"
            aria-label={t("topbar.toggleFilters")}
            aria-expanded={isSidebarOpen}
            onClick={onToggleSidebar}
            className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] lg:hidden ${
              isSidebarOpen
                ? "bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            <FilterIcon />
          </button>

          {/* Nav burger — mobile/tablet only */}
          <button
            type="button"
            aria-label={t("navbar.toggleMenu")}
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] lg:hidden"
          >
            <BurgerIcon isOpen={isNavOpen} />
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown — slides down from topbar */}
      <div
        className={`
          absolute left-0 right-0 top-full z-50
          border-t border-[var(--color-border)] bg-[var(--color-bg)] shadow-md
          transition-all duration-300 ease-in-out lg:hidden
          ${isNavOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}
        `}
      >
        <ul className="flex list-none flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map(({ to, labelKey }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  `block w-full rounded-[var(--radius-sm)] px-4 py-3 text-[length:var(--font-sm)] transition-colors duration-150 ${
                    isActive
                      ? "bg-[var(--color-primary)] font-medium text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
                  }`
                }
              >
                {t(labelKey)}
              </NavLink>
            </li>
          ))}

          <li className="mt-2 border-t border-[var(--color-border)] pt-2">
            <LanguageSwitcher variant={LANGUAGE_SWITCHER_VARIANTS.INLINE} />
          </li>
        </ul>
      </div>
    </header>
  );
}
