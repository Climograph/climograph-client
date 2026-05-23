import { LOCAL_STORAGE_KEYS } from "@/constants";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, es, uk } from "./locales";

await i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    uk: { translation: uk },
  },
  load: "currentOnly",
  lng: localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE)?.toLowerCase() ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  nonExplicitSupportedLngs: true,
});
