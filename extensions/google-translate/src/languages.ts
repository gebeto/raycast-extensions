import { getPreferenceValues } from "@raycast/api";
import { languages as _languages } from "../vendor/@iamtraction-translate/src/languages";

export type LanguageCode = keyof typeof _languages;
export type LanguageName = (typeof _languages)[LanguageCode];
export type LanguagesItem = {
  code: LanguageCode;
  name: LanguageName;
};
export const english: LanguagesItem = { code: "en", name: _languages.en };
export const autoDetect: LanguagesItem = { code: "auto", name: _languages.auto };
const preferences = getPreferenceValues();
const flagsPreference: string = preferences.flags ?? "";
const flags: Partial<Record<LanguageCode, string>> = flagsPreference.split(" ").reduce(
  (prev, curr) => {
    const [key, val] = curr.split(":");
    return {
      ...prev,
      [key]: val,
    };
  },
  {} as Partial<Record<LanguageCode, string>>,
);

console.log(" >>> FLAS", flags);

export const languages: LanguagesItem[] = (Object.keys(_languages) as (keyof typeof _languages)[]).map((code) => ({
  code,
  name: _languages[code],
}));

export const supportedLanguagesByCode = languages.reduce(
  (acc, lang) => ({
    ...acc,
    [lang.code]: lang,
  }),
  {} as Record<LanguageCode, LanguagesItem>,
);
export const supportedLanguagesByCountry = languages.reduce(
  (acc, lang) => ({
    ...acc,
    [lang.name]: lang,
  }),
  {} as Record<LanguageName, LanguagesItem>,
);
