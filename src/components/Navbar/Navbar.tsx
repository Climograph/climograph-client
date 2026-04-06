import { NAV_LINKS } from "@/constants";
import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <nav
      className={`
        sticky top-0 z-50 w-full 
        border-b border-[var(--color-border)] 
        bg-[var(--color-bg)]
      `}
    >
      <div className={`max-w-[960px] mx-auto px-4 h-20 flex items-center justify-between`}>
        <span className={`text-[length:var(--font-xl)] font-bold text-[var(--color-primary)]`}>
          Climograph
        </span>

        <ul className={`flex items-center gap-3 list-none`}>
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `
                    px-4 py-2 rounded-[var(--radius-sm)] text-[length:var(--font-md)]
                    transition-colors duration-150
                    ${
                      isActive
                        ? `bg-[var(--color-primary)] text-[var(--color-bg)]`
                        : `text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]`
                    }
                  `
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
