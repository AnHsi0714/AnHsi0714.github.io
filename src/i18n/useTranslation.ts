import { useLanguage } from '../context/LanguageContext'
import { strings } from './strings'

export function useTranslation() {
  const { language } = useLanguage()
  return { t: strings[language], language }
}
