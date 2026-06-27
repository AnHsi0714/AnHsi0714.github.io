import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? '切換成淺色模式' : '切換成深色模式'}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-border)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-transform duration-200"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-text)',
          transform: isDark ? 'translateX(1.75rem)' : 'translateX(0)',
        }}
      >
        {isDark ? '月' : '日'}
      </span>
    </button>
  )
}