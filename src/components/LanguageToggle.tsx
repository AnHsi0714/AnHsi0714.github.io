import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/useTranslation'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  const { t } = useTranslation()
  const isEnglish = language === 'en'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={isEnglish ? t.languageToggle.switchToChinese : t.languageToggle.switchToEnglish}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-border)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium leading-none tracking-tighter transition-transform duration-200"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-text)',
          transform: isEnglish ? 'translateX(1.75rem)' : 'translateX(0)',
        }}
      >
        {isEnglish ? 'EN' : '中'}
      </span>
    </button>
  )
}
