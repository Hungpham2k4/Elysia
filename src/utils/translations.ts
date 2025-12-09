/**
 * Common translations (used across all modules)
 */
export const commonTranslations = {
  en: {
    required: "Field '$field' is required",
    email: "Field '$field' must be a valid email",
    minLength: "Field '$field' must have at least $min characters",
    invalid: "Invalid request data",
  },
  vi: {
    required: "$field không được để trống",
    email: "Trường '$field' phải là email hợp lệ",
    minLength: "Trường '$field' phải có ít nhất $min ký tự",
    invalid: "Dữ liệu không hợp lệ",
  },
} as const;

export type CommonTranslationKey = keyof typeof commonTranslations.en;
export type Language = keyof typeof commonTranslations;

/**
 * Module translations registry
 * Each module should register its translations here
 */
const moduleTranslations = new Map<string, Record<Language, Record<string, string>>>();

/**
 * Register translations from a module
 */
export function registerTranslations(
  moduleName: string,
  translations: Record<Language, Record<string, string>>
): void {
  moduleTranslations.set(moduleName, translations);
}

/**
 * Get all translations (common + module translations)
 */
function getAllTranslations(): Record<Language, Record<string, string>> {
  const all: Record<Language, Record<string, string>> = {
    en: { ...commonTranslations.en },
    vi: { ...commonTranslations.vi },
  };

  // Merge module translations
  moduleTranslations.forEach((translations) => {
    Object.keys(translations).forEach((lang) => {
      all[lang as Language] = {
        ...all[lang as Language],
        ...translations[lang as Language],
      };
    });
  });

  return all;
}

/**
 * Translate a key
 * @param key - Translation key (can be from common or any module)
 * @param lang - Language code
 * @param params - Parameters to replace in the translation
 */
export const translate = (
  key: string,
  lang: Language = "vi",
  params?: Record<string, string | number>
): string => {
  const translations = getAllTranslations();
  const template = translations[lang]?.[key] || translations.vi[key] || key;

  if (!params) return template;

  let result: string = template;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = result.replace(`$${paramKey}`, String(paramValue));
    result = result.replace(`'$${paramKey}'`, String(paramValue));
  }

  return result;
};
