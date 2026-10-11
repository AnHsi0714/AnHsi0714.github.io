import { useLanguage } from '../context/LanguageContext'
import { strings } from '../i18n/strings'
import { useTranslation } from '../i18n/useTranslation'
import Tooltip from './Tooltip'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const isEnglish = language === 'en'

  // 提示用「切換後的語言」寫：萬一讀者看不懂目前的介面語言，仍能看懂這顆按鈕要做什麼
  const hint = isEnglish ? strings.zh.languageToggle.hintToChinese : strings.en.languageToggle.hintToEnglish

  return (
    <div className="flex h-8 items-center">
      <Tooltip content={hint} underline={false} focusable={false}>
        <button
          type="button"
          onClick={() => setLanguage(isEnglish ? 'zh' : 'en')}
          aria-label={isEnglish ? t.languageToggle.switchToChinese : t.languageToggle.switchToEnglish}
          className="cursor-pointer text-lg font-semibold leading-none text-[var(--color-text)] hover:text-[var(--color-primary)]"
        >
          {isEnglish ? 'EN' : '中'}
        </button>
      </Tooltip>
    </div>
  )
}
