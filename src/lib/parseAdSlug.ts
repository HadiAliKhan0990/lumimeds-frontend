export interface ParsedAdSlug {
  pageName: string;
  language: string;
}

const SUPPORTED_LANGUAGES = ['spanish', 'french', 'german', 'italian', 'portuguese'];

/**
 * Parses an ad slug to extract the page name and language.
 * 
 * Examples:
 * - "med-spa1" → { pageName: "med-spa1", language: "en" }
 * - "med-spa1_spanish" → { pageName: "med-spa1", language: "spanish" }
 * - "glp1-program_french" → { pageName: "glp1-program", language: "french" }
 * 
 * @param slug - The ad slug from the URL
 * @returns ParsedAdSlug object with pageName and language
 */
export function parseAdSlug(slug: string): ParsedAdSlug {
  // Check if slug contains an underscore (language separator)
  const underscoreIndex = slug.lastIndexOf('_');
  
  if (underscoreIndex === -1) {
    // No language suffix, default to English
    return {
      pageName: slug,
      language: 'en',
    };
  }
  
  // Extract potential language suffix
  const potentialLang = slug.substring(underscoreIndex + 1).toLowerCase();
  const pageName = slug.substring(0, underscoreIndex);
  
  // Validate if it's a supported language
  if (SUPPORTED_LANGUAGES.includes(potentialLang)) {
    return {
      pageName,
      language: potentialLang,
    };
  }
  
  // If not a supported language, treat the whole slug as page name
  return {
    pageName: slug,
    language: 'en',
  };
}

/**
 * Gets the language code from a language name
 * 
 * @param language - Language name (e.g., "spanish", "french")
 * @returns Two-letter language code (e.g., "es", "fr")
 */
export function getLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    en: 'en',
    english: 'en',
    spanish: 'es',
    español: 'es',
    es: 'es',
    french: 'fr',
    français: 'fr',
    fr: 'fr',
    german: 'de',
    deutsch: 'de',
    de: 'de',
    italian: 'it',
    italiano: 'it',
    it: 'it',
    portuguese: 'pt',
    português: 'pt',
    pt: 'pt',
  };
  
  return languageMap[language.toLowerCase()] || 'en';
}

