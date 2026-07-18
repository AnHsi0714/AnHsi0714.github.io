import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "../i18n/useTranslation";

export default function NavBar() {
  const { t } = useTranslation();

  const links = [
    { to: "/", label: "Cheng An Hsi" },
    { to: "/about", label: t.nav.about },
    { to: "/experience", label: t.nav.experience },
    { to: "/projects", label: t.nav.projects },
    { to: "/articles", label: t.nav.articles },
    { to: "/gallery", label: t.nav.gallery },
    { to: "/dreams", label: t.nav.dreams },
    { to: "/friends", label: t.nav.friends },
    { to: "/dev/components", label: t.nav.devComponents },
    { to: "/dev/creature", label: t.nav.devCreature },
    { to: "/dev/creature-builder", label: t.nav.devCreatureBuilder },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex flex-wrap items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
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
      <LanguageToggle />
      <ThemeToggle />
    </nav>
  );
}
