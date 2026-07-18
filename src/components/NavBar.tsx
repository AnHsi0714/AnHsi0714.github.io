import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "../i18n/useTranslation";

export default function NavBar() {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);

  // NavBar 用 flex-wrap，實際高度會隨語言、視窗寬度換行而變（手機甚至會
  // 疊到 3 行）。曝露成 CSS 變數，讓需要「扣掉 NavBar 淨空」的頁面（例如
  // 畫廊展場的滿版房間）能用 calc() 動態算，不用自己猜一個容易過時的數字。
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--nav-h",
        `${el.offsetHeight}px`,
      );
    };
    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const links = [
    { to: "/", label: "Cheng An Hsi" },
    { to: "/about", label: t.nav.about },
    { to: "/experience", label: t.nav.experience },
    { to: "/projects", label: t.nav.projects },
    { to: "/articles", label: t.nav.articles },
    { to: "/gallery", label: t.nav.gallery },
    { to: "/playground", label: t.nav.playground },
  ];

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3"
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            isActive
              ? "font-semibold text-[var(--color-text)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }
        >
          {link.label}
        </NavLink>
      ))}
      <NavLink
        to="/about#resume"
        className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        {t.nav.cv}
      </NavLink>
      <div className="ml-auto flex items-center gap-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </nav>
  );
}
