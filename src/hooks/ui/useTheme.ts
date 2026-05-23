import { LOCAL_STORAGE_KEYS } from "@/constants";
import { useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, "light");
    }
  }

  return { isDark, toggleTheme };
}
