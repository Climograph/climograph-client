export const LANGUAGE_SWITCHER_VARIANTS = {
  DROPDOWN: "dropdown",
  INLINE: "inline",
} as const;

export type TLanguageSwitcherVariant =
  (typeof LANGUAGE_SWITCHER_VARIANTS)[keyof typeof LANGUAGE_SWITCHER_VARIANTS];

export type TLanguageSwitcherProps = {
  variant?: TLanguageSwitcherVariant;
};
