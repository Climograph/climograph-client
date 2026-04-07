import { WikidataService } from "@/api";
import { TIME_CONSTANTS } from "@/constants";
import type { TWikidataCity } from "@/types/domain/location";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TSearchBarProps } from "./SearchBar.type";

export function SearchBar({ onCitySelect }: TSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TWikidataCity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      WikidataService.searchCity(value.trim())
        .then((cities) => {
          setResults(cities);
          setIsOpen(cities.length > 0);
        })
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, TIME_CONSTANTS.FOUR_HUNDRED_MILLISECONDS);
  }

  function handleSelect(city: TWikidataCity) {
    setQuery(city.label);
    setIsOpen(false);
    onCitySelect(city);
  }

  return (
    <div ref={containerRef} className={`relative w-full max-w-[480px]`}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={t("search.placeholder")}
        className={`
          w-full px-3 md:px-4 py-2
          text-[length:var(--font-sm)] md:text-[length:var(--font-md)] 
          placeholder:text-[var(--color-text-secondary)]
          border-2 border-[var(--color-border)] rounded-[var(--radius-md)] outline-none
          focus:border-[var(--color-primary)]
          transition-colors duration-200
        `}
      />

      {isLoading && (
        <span
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px]
            border-2 border-[var(--color-border)] border-t-[var(--color-primary)] 
            rounded-[var(--radius-md)] 
            animate-spin
          `}
        />
      )}

      {isOpen && (
        <ul
          className={`
            absolute top-[calc(100%+4px)] left-0 right-0 
            max-h-[280px]
            bg-[var(--color-bg)] 
            border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-md 
            overflow-y-auto z-[1000] list-none
          `}
        >
          {results.map((city) => (
            <li key={city.id}>
              <button
                onClick={() => handleSelect(city)}
                className={`
                  flex flex-col w-full px-4 py-2
                  border-none 
                  text-left text-[length:var(--font-sm)] md:text-[length:var(--font-md)]
                  bg-transparent hover:bg-[var(--color-bg-secondary)]
                  cursor-pointer
                  transition-colors duration-150
                `}
              >
                <span className={`font-medium text-[var(--color-text)]`}>{city.label}</span>
                <span
                  className={`
                    text-[length:var(--font-xs)] md:text-[length:var(--font-sm)] 
                    text-[var(--color-text-secondary)]
                  `}
                >
                  {city.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
