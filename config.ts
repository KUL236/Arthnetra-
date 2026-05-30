import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';

// Guard for SSR — i18next-browser-languagedetector is browser-only
const isBrowser = typeof window !== 'undefined';

if (!i18n.isInitialized) {
  const plugins: any[] = [initReactI18next];

  if (isBrowser) {
    // Dynamic import-style: only load detector in browser
    const LanguageDetector = require('i18next-browser-languagedetector').default;
    plugins.unshift(LanguageDetector);
  }

  let instance = i18n;
  for (const plugin of plugins) {
    instance = instance.use(plugin);
  }

  instance.init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    lng: 'en',
    interpolation: { escapeValue: false },
    ...(isBrowser && {
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    }),
  });
}

export default i18n;
