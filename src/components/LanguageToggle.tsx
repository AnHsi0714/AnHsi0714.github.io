import { flushSync } from 'react-dom'
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

  // 整頁文字會在同一幀全部換掉，用 View Transition 讓它淡入淡出而不是瞬間跳變；
  // flushSync 確保 callback 結束前 DOM 已更新，瀏覽器才抓得到「換完之後」的畫面。
  // 不支援的瀏覽器直接換，reduced-motion 的取消由 index.css 處理。
  const switchLanguage = () => {
    const next = isEnglish ? 'zh' : 'en'
    if (typeof document.startViewTransition !== 'function') {
      setLanguage(next)
      return
    }
    // 整頁文字一起換，比換頁轉場慢一點才不會像閃一下；時間長短由 index.css
    // 依 data-view-transition 區分，轉場結束後移除，免得影響之後的換頁轉場
    const root = document.documentElement
    root.dataset.viewTransition = 'language'
    const transition = document.startViewTransition(() => flushSync(() => setLanguage(next)))
    transition.finished.finally(() => {
      delete root.dataset.viewTransition
    })
  }

  return (
    <div className="flex h-8 items-center pointer-coarse:h-11">
      <Tooltip content={hint} underline={false} focusable={false}>
        <button
          type="button"
          onClick={switchLanguage}
          aria-label={isEnglish ? t.languageToggle.switchToChinese : t.languageToggle.switchToEnglish}
          className="inline-flex h-full cursor-pointer items-center justify-center text-lg font-semibold leading-none text-[var(--color-text)] hover:text-[var(--color-primary)] pointer-coarse:min-w-11"
        >
          {isEnglish ? 'EN' : '中'}
        </button>
      </Tooltip>
    </div>
  )
}
