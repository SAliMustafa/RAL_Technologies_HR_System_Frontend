export const LANGUAGES = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dir: "ltr",
  },
  ar: {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    dir: "rtl",
  },
};

export const DEFAULT_LANGUAGE = "en";

export function getLanguageDirection(languageCode) {
  return LANGUAGES[languageCode]?.dir || "ltr";
}