import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/translation.json'
import he from './locales/he/translation.json'
import es from './locales/es/translation.json'
import fr from './locales/fr/translation.json'
import de from './locales/de/translation.json'
import ptBR from './locales/pt-BR/translation.json'
import ptPT from './locales/pt-PT/translation.json'
import ja from './locales/ja/translation.json'
import zhCN from './locales/zh-CN/translation.json'

// Get saved language from settings (will be set by App.tsx after loading settings)
const getSavedLanguage = (): string => {
  try {
    // Try to get from localStorage as fallback for browser mode
    return localStorage.getItem('clippilot-language') || 'en'
  } catch {
    return 'en'
  }
}

void i18n
  .use(initReactI18next)
  .init({
    resources: { 
      en: { translation: en }, 
      he: { translation: he },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      'pt-BR': { translation: ptBR },
      'pt-PT': { translation: ptPT },
      ja: { translation: ja },
      'zh-CN': { translation: zhCN }
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n