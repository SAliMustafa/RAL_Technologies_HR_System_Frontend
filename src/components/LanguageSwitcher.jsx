import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../i18n/languages";

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  function handleChange(event) {
    i18n.changeLanguage(event.target.value);
  }

  return (
    <label>

      <select value={i18n.resolvedLanguage} onChange={handleChange}>
        {Object.values(LANGUAGES).map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;