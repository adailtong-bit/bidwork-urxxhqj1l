import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations, Language } from '@/lib/translations'
import { ptBR, enUS } from 'date-fns/locale'
import { format } from 'date-fns'

interface LanguageState {
  currentLanguage: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (value: number) => string
  formatDate: (date: Date, formatStr: string) => string
  getDateLocale: () => any
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'pt',
      setLanguage: (lang) => set({ currentLanguage: lang }),
      t: (key, params) => {
        const lang = get().currentLanguage
        let text = translations[lang][key] || key

        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v))
          })
        }

        return text
      },
      formatCurrency: (value) => {
        const lang = get().currentLanguage
        const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
        const currency = lang === 'pt' ? 'BRL' : 'USD'
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(value)
      },
      formatDate: (date, formatStr) => {
        const locale = get().getDateLocale()
        return format(date, formatStr, { locale })
      },
      getDateLocale: () => {
        const lang = get().currentLanguage
        return lang === 'pt' ? ptBR : enUS
      },
    }),
    {
      name: 'language-storage',
    },
  ),
)
