import { useLanguage } from '../context/LanguageContext'

export function useLocalized<T>(zh: T, en: T): T {
  const { language } = useLanguage()
  return language === 'en' ? en : zh
}
