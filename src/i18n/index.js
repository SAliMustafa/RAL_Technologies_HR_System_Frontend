import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import arCommon from "../locales/ar/common.json";

import { DEFAULT_LANGUAGE, getLanguageDirection } from "./languages";

const resources = {
  en: {
    common: enCommon,
  },
  ar: {
    common: arCommon,
  },
};

function updateDocumentLanguage(language) {
  const direction = getLanguageDirection(language);

  document.documentElement.lang = language;
  document.documentElement.dir = direction;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    fallbackLng: DEFAULT_LANGUAGE,

    supportedLngs: ["en", "ar"],

    ns: ["common"],
    defaultNS: "common",

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

updateDocumentLanguage(i18n.resolvedLanguage || DEFAULT_LANGUAGE);

i18n.on("languageChanged", (language) => {
  updateDocumentLanguage(language);
});

export default i18n;