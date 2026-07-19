import { useTheme } from "../hooks/useTheme";

// FontAwesome free-solid 裡唯一的太陽圖示（faSun）在這個尺寸下光芒太密，
// 看起來像齒輪，改用線條版自畫 SVG（圓+8道短射線），跟月亮用同一種畫法保持風格一致。
function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "切換成淺色模式" : "切換成深色模式"}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-border)",
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs leading-none transition-transform duration-200"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-text)",
          transform: isDark ? "translateX(1.75rem)" : "translateX(0)",
        }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
