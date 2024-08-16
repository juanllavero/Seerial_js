import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialization
i18n
  .use(HttpBackend) // Load localizations from the backend (Crowdin)
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next) // React integration
  .init({
    fallbackLng: 'en', // Default language
    supportedLngs: ['en', 'es', 'de', 'fr', 'it'], // Supported languages
    debug: true,
    interpolation: {
      escapeValue: false, // React ya se encarga de escapar las variables
    },
    backend: {
      loadPath: './src/locales/{{lng}}.json', // Ruta donde se encuentran los archivos de traducción
    },
  });

export default i18n;